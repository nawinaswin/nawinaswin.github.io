---

title: "Future of intelligent silicon"
date: 2026-02-20
tags: ["chips", "lithography", "Von-Neumann", "DRAM", "HBM", "SRAM", "nvidia", "groq", "cerebras"]
draft: false
------------


# What If We Are Spending Silicon on the Wrong Thing?

I keep coming back to a fairly simple suspicion: what if we are spending silicon on the wrong thing?

Modern computing is overwhelmingly organized around arithmetic throughput. We talk about FLOPS, tensor cores, matrix engines, wider execution units, higher frequencies, bigger accelerators, faster HBM. And none of that is irrational. If your workload is a giant matrix multiplication, this is exactly what you should optimize. But the machine I keep imagining is not really a matrix processor. It is closer to an artificial nervous system: continuously running, locally learning, maintaining enormous amounts of internal state, communicating sparsely, and interacting with the physical world through feedback loops.

Once I start thinking about that machine, a lot of assumptions in conventional accelerator design start looking backwards.

The first one is frequency.

## I Don't Think Intelligence Needs Gigahertz

We currently run processors at several gigahertz because we can, and because conventional software benefits from making sequential work finish as quickly as possible. But if I am thinking about an artificial nervous system, I don't actually need its meaningful state to evolve five billion times every second.

Even biological systems operate at frequencies that are absurdly slow by semiconductor standards. So suppose I am extremely generous. Instead of biological-scale update rates, let me say the machine gets a full meaningful update loop at **1,000 Hz**. Or, if I want enormous temporal headroom, make it **10,000 Hz**.

Ten kilohertz is still nothing compared with a 3–5 GHz processor.

That immediately creates an interesting trade. Instead of building relatively few extremely fast processing structures, I can build enormous numbers of slower ones and let them operate simultaneously. I am trading temporal density for spatial density.

And for this particular workload, that does not feel like an artificial trick. Neural computation is already highly parallel. If a million things can happen independently, why am I so obsessed with making one thing happen five billion times per second?

That also gives me room to lower voltage, switching activity and thermal density. I am not saying the underlying transistors literally need to toggle only 10,000 times per second. There might still be internal machinery running at tens or hundreds of megahertz. But the **architectural timescale** of the network can be orders of magnitude slower than conventional processor clocks.

To me, that seems much more compatible with a continuously operating machine.

## Start With a Neuron

So I started doing stupid back-of-the-envelope calculations.

Take an average artificial neuron with **10,000 incoming synapses**. Obviously biological neurons vary enormously, and I am not claiming 10,000 is some universal biological constant. It is just a useful scale.

Now suppose every synapse requires something like **10–15 floating-point operations per update**. I am deliberately giving myself substantially more than a simple multiply-accumulate because I am not imagining ordinary inference. There might be local learning, latent potentials, state updates, threshold calculations, decay terms, conditional behavior and other operations associated with each connection.

At a 10 kHz network update rate, one neuron therefore wants approximately:

\[
10,000 \times 10\text{–}15 \times 10,000
\]

or roughly **1–1.5 billion floating-point operations per second**.

Now suppose one of my processing cores has roughly **1–1.5 TFLOP/s** of useful arithmetic capability. That is not remotely exotic by modern standards. Depending on the exact assumptions, that puts me somewhere around **1,000 neurons per core**.

That number became fairly important in my head.

One relatively powerful local processing core, approximately a thousand neurons, and all the state those neurons need sitting physically nearby.

But once I got there, I realized the arithmetic was not actually the scary part.

The memory was.

## The Weight Is Almost the Least Interesting Part

If a neuron has 10,000 synapses and each weight is FP16, then the weights alone are around:

\[
10,000\times2\text{ bytes}=20\text{ KB}
\]

per neuron.

For 1,000 neurons, that is only about **20 MB of weights per core**.

That initially sounds incredibly manageable.

But that is not actually the system I am designing. A weight is not just a weight. There are auxiliary constants, latent weight potentials, learning variables, node state, potentially eligibility traces, thresholds, connectivity information, accumulated statistics and whatever other variables the eventual learning rule requires.

At various points my rough estimates were around **1 GB** if I became extremely aggressive with low-bit state, perhaps around **2 GB** under other precision assumptions. But once I started thinking honestly about everything that might need to remain resident, I started expecting something more like **6–9 GB of SRAM-class active state** across the relevant processing structure.

Those numbers are rough. They are not the result of a finalized RTL design. But the important realization is independent of whether the final answer is 4 GB, 7 GB or 12 GB.

This is not a compute chip with some memory attached.

This is a **memory machine with computation embedded into it**.

And once I started thinking about it that way, spending enormous amounts of silicon area on SRAM stopped seeming absurd.

## Why Is SRAM Considered the Waste?

We are already willing to manufacture enormous pieces of silicon. Top-end consumer chips are getting into the hundreds of square millimeters. Datacenter-class processors have pushed into something like the **700–800 mm²** range, and the industry is already using chiplets and advanced packaging because conventional monolithic dies run into reticle and yield constraints.

So if we are already willing to spend something approaching 500, 700 or 800 square millimeters on a processor, why is allocating most of that area to arithmetic considered sophisticated, while allocating it to SRAM somehow feels wasteful?

Maybe for this workload the arithmetic is the waste.

I don't need giant tensor arrays performing dense matrix multiplication all day. I need enormous amounts of persistent state, accessed continuously and locally.

That led me to what I think is probably the central principle of the entire architecture:

**state locality should be the primary resource; arithmetic throughput should be secondary.**

## Break the von Neumann Problem Instead of Feeding It

The conventional architecture separates memory and computation and then spends enormous engineering effort trying to hide the consequences.

Caches. Prefetchers. Wide memory controllers. HBM. Coherence protocols. Gigantic buses. Scheduling machinery. Speculation. All of these mechanisms are extraordinary engineering achievements, but at some level they exist because information keeps having to move between where it is stored and where it is processed.

I want to attack that distinction directly.

If one core owns roughly 1,000 neurons, then their weights and their continuously changing state should live next to that core. Ideally the memory and the arithmetic are physically close enough that talking about "memory bandwidth" in the usual sense becomes misleading.

The architecture I want is much more like:

\[
\text{local SRAM} \leftrightarrow \text{local arithmetic}
\]

repeated enormous numbers of times.

The long-distance NoC should not carry weights. It should not carry giant intermediate matrices. It should not constantly drag operands across the chip.

The things that travel should mostly be **activations**.

And because neural activity can be sparse, those activations can be tiny compared with the amount of local state being processed.

## Why Multiply by Zero 9,990 Times?

This is probably where I become most hostile to conventional dense accelerator thinking.

Suppose a neuron has 10,000 potential incoming synapses, but on a particular update only **10 presynaptic neurons are active**.

Why would I perform 10,000 multiplications?

Nine thousand nine hundred and ninety of them are just:

\[
w_i\times0
\]

That isn't meaningful work. It is work created by the representation.

If 10 inputs are active, I want to retrieve those 10 weights and operate on those 10 weights.

That changes the computational primitive completely.

Instead of:

\[
\mathbf{w}\cdot\mathbf{x}
\]

implemented as a dense vector operation, I increasingly care about:

\[
i_1,i_2,\ldots,i_k
\rightarrow
w[i_1],w[i_2],\ldots,w[i_k]
\]

where \(k\ll N\).

Now the interesting problem is not matrix multiplication.

It is **arbitrary gather**.

And suddenly the address-generation logic, bank organization, SRAM topology, row decoders and column decoders become part of the computational architecture rather than boring peripheral circuitry.

## The Core Should Be Smarter Than a Tensor Tile

This is also why I have become skeptical of tensor arrays for this machine.

Companies like Groq have done genuinely interesting work by rethinking scheduling and dataflow, but those machines are still heavily oriented around tensor computation. The individual computational node is not really the thing being given enormous behavioral complexity.

My instinct is almost the reverse.

I want the individual processing core to be surprisingly capable.

It might look less like a miniature GPU and more like a compact CPU core with very strong vector machinery. There is branching. There is indexing. There are conditional state updates. There are comparisons. There is local learning logic. There is irregular memory access. There is connectivity metadata to manipulate.

So perhaps the core looks like:

\[
\text{scalar/control pipeline}
+
\text{SIMD engines}
+
\text{gather/address engine}
+
\text{local SRAM}
+
\text{NoC interface}
\]

The scalar side deals with the irregularity. The SIMD side handles whatever parallel arithmetic actually exists.

In other words, I don't necessarily want to make irregular neural computation pretend that it is regular.

I would rather build hardware that is unusually good at irregular computation.

## SIMD, But Not One Giant SIMD Hammer

Even here, I don't necessarily want one gigantic fixed-width vector unit.

I have thought about widths like **16, 28, 32 or 64 lanes**. The exact numbers are obviously architectural choices, but the idea is that different amounts of parallelism exist at different moments.

Perhaps a 64-wide structure can partition itself into two 32-wide units or four 16-wide units. Perhaps different cores specialize somewhat differently. Perhaps masked execution can disable most of the structure when activity is sparse.

If only 10 synapses need work, I don't want 64 arithmetic lanes burning energy merely because the hardware designers decided 64 was aesthetically pleasing.

Again, the central issue is not maximum theoretical FLOPS. It is **useful operations per joule**.

## The Memory Decoder Becomes Part of the Machine

Once arbitrary gather becomes common, SRAM organization gets much more interesting.

A normal SRAM array has row decoders, wordlines, bitlines, sense amplifiers, column selects and all of the circuitry necessary to turn a binary address into an actual physical selection.

For this architecture, those structures become extremely important because the workload is dominated by indexed access to local state.

Of course, I cannot just create millions of microscopic SRAM banks. Every bank needs peripheral circuitry. Row decoders consume area. Sense amplifiers consume area. Drivers consume area. Routing consumes area. At some point the memory-control structures overwhelm the memory cells themselves.

So there is a real optimization problem here: how small can the SRAM banks become before decoder and peripheral overhead dominates?

The metric I care about may be something like:

\[
\frac{\text{independent random accesses}}
{\text{joule}\cdot\text{mm}^2}
\]

rather than sequential bandwidth.

I probably want hierarchical decoding, very good predecoders, short wordlines, aggressive banking, clever address interleaving and a gather engine capable of issuing many independent accesses simultaneously.

If 16 active synapses need weights, ideally those requests land in 16 independently accessible banks rather than serializing behind one giant SRAM structure.

That is a very different memory system from the one we build to feed GPUs.

## The NoC Should Mostly Move Events

Once most state is resident locally, the NoC changes character too.

Suppose activity is extremely sparse. I was throwing around numbers like **0.01% activity**, sometimes thinking in examples like 10 active connections out of 10,000. Those exact percentages were back-of-the-envelope and obviously depend on what precisely we call "active," but the architectural intuition is what matters: only a tiny fraction of the network needs to communicate globally during a given update.

Then the NoC does not need monstrous tensor bandwidth.

It needs efficient **event routing**.

The important problem becomes fan-out. One active neuron might connect to many neurons distributed across the machine. That makes multicast and routing topology much more interesting than raw byte throughput.

The machine starts looking less like a processor moving arrays and more like a physical graph whose nodes occasionally announce state changes.

That feels much closer to the abstraction I actually want.

## The Machine Should Grow Upward

Once I admit that SRAM dominates the physical design, planar scaling eventually becomes awkward.

But that also makes 3D integration feel almost inevitable.

Suppose today's practical logic stack gives me perhaps something like 10–20 important interconnect layers, and even if future technology roughly doubles what is comfortable, there is still a fundamental geometric problem: I want much more local state than a single planar surface naturally provides.

So instead of continually making the die wider, build upward.

My mental picture is a stack of dense silicon tiers with extremely thin interlayers between them, using hybrid bonding, TSV-like vertical connections or whatever finer-pitch descendants of those technologies become practical.

SRAM-heavy layer.

Compute layer.

Another SRAM-heavy layer.

Another compute layer.

And so on.

Eventually the package stops looking like a flat processor and starts looking like a **volumetric computational material**.

## Cooling Should Be Part of the Structure

That is also where my cooling idea comes from.

I am not imagining a giant liquid-cooled server block with hoses pumping fluid in and out. If I am deliberately lowering clock rates and distributing work across enormous numbers of processing elements, I should also be reducing local thermal density.

So I imagine the module itself being sealed, with a dielectric cooling medium contained inside the package. Thin thermally conductive separator layers spread heat laterally. The fluid absorbs local thermal gradients and redistributes them toward the package shell.

The picture in my head is not macroscopic. It is a compact semiconductor module, perhaps a small cube or block. If you cut through it, you would see tightly packed laminar silicon tiers, vertical interconnects and very thin thermal/fluid regions.

From the outside it might look almost boring.

A dense sealed block.

Perhaps only a minimal set of external electrical interfaces.

In the more metaphorical version I was imagining essentially two major pathways emerging from the package: afferent and efferent communication, also carrying whatever baseline power and signaling infrastructure is necessary. Something vaguely analogous to a brain stem attached to an enclosed computational organ.

The analogy is obviously loose, but I like it.

The fluid surrounding the computational structure is almost analogous to cerebrospinal fluid—not because I am trying to reproduce biology literally, but because the system becomes mechanically and thermally self-contained.

[Insert cutaway concept image here.]

## Biology Is Still Doing Something We Cannot Really Do

This is where I also had to correct myself during the conversation.

It is tempting to compare silicon and biology by saying something like, "this silicon arithmetic unit performs so many teraFLOPS per watt, therefore it is more energy-efficient than neurons."

That comparison is mostly nonsense.

A synaptic cleft is not one floating-point operation.

A neuron is not a dot product.

There is an absurd amount of physical computation happening inside biology: ion gradients, membrane potentials, receptor kinetics, molecular binding, diffusion, structural changes, intracellular signaling, metabolic regulation, gene expression. Even if I abstract every synaptic event into some equivalent number of arithmetic operations, I am still throwing away enormous amounts of what the physical system is doing.

Biology has a fundamental advantage because the actual configuration of matter is itself part of the information-processing system.

There is no clean separation between "memory," "computation," and "physical state."

The molecules are the state.

Their positions are the state.

Their bonds are the state.

Their diffusion is part of the dynamics.

Digital silicon cannot really reproduce that elegance.

And I do not think we should pretend it can.

## I Am Willing to Lose on Energy

The compromise I actually find interesting is different.

Suppose a human brain uses roughly **20 watts**.

Maybe my artificial machine needs **100 times more power**. Maybe it needs hundreds or a couple thousand watts. Fine.

If I can get something like **1,000 times the speed**, or vastly greater memory capacity, or much faster learning, or substantially larger network scale, then I may be perfectly happy with that trade.

Those numbers—100× the energy, 1,000× the speed or capability—are not predictions. They are the shape of the bargain I have in mind.

I don't need to beat biology at its own game.

I need to exploit the things engineered silicon can do that biology cannot.

Silicon can be reproducible. Modular. Precisely wired. Inspectable. Repairable. Deterministic when I want it to be. Fabricated with enormous regularity. Connected using topologies evolution never had access to.

So perhaps the realistic ambition is not:

"build something more energy-efficient than the brain."

Perhaps it is:

"accept being radically less energy-efficient than the brain, but use that energy to buy enormous advantages in speed, scale, reliability and controllability."

That feels much more intellectually honest.

## The Architecture Keeps Collapsing Toward the Same Answer

What I find interesting is that I did not really start with one grand architectural principle and derive everything else.

I kept poking different parts of the problem and repeatedly ended up in the same place.

I asked how much arithmetic a neuron needs.

That pushed me toward roughly 1,000 neurons per strong local core.

I asked how much memory those neurons need.

That pushed me toward SRAM dominating the chip.

I asked how sparse activity changes computation.

That pushed me away from dense matrix multiplication and toward indexed gather.

I asked what indexed gather requires.

That pushed me toward aggressive banking, exceptional row/column decoding and complex local address-generation hardware.

I asked what kind of execution unit naturally handles that.

That pushed me toward CPU-like control plus SIMD rather than tensor arrays.

I asked what needs to move across the chip.

That reduced mostly to activations, pushing me toward a sparse multicast-oriented NoC.

I asked how to fit all the state physically.

That pushed me toward 3D stacking.

I asked how to cool a thick 3D structure.

That pushed me toward integrated thermal layers and sealed dielectric-fluid heat spreading.

And I asked how fast the thing actually needs to run.

That pushed me away from gigahertz obsession and toward enormous parallelism at much lower effective update rates.

All of these roads keep converging.

## Maybe FLOPS Are Just the Wrong Organizing Principle

The more I think about it, the more I suspect the basic inversion is this.

Modern accelerators say:

**Arithmetic is precious. Keep the arithmetic hardware busy and move data toward it.**

I want to say:

**State is precious. Keep the state stationary and put enough computation beside it that almost nothing needs to move.**

That sounds like a subtle difference, but physically it produces an almost completely different machine.

Massive SRAM instead of massive tensor arrays.

Sparse gathers instead of dense matrices.

Local learning instead of centralized weight updates.

Moderate SIMD instead of enormous matrix engines.

Complex node behavior instead of treating nodes as elements of a tensor.

Multicast events instead of moving giant intermediate activations.

Thousands or tens of thousands of meaningful updates per second instead of billions of globally meaningful clock cycles.

And eventually, a vertically integrated block of memory, computation, communication and thermal management rather than a conventional flat processor.

I don't know what the final numbers will be. Maybe 10 kHz is excessive. Maybe 1,000 neurons per core is wrong. Maybe 6–9 GB of SRAM becomes 4 GB or 15 GB. Maybe the correct SIMD width is 16 instead of 64. These are not sacred constants.

But the direction increasingly feels coherent.

For this kind of machine, FLOPS are not irrelevant.

They are simply not the thing around which the architecture should be organized.

The machine should be organized around **persistent local state**.

Everything else follows from that.