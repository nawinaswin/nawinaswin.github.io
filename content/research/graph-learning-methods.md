---

title: "The Future of Deep Learning Might Be Graphical"
date: 2026-05-05
tags: ["deep-learning", "graph-networks", "neuroscience", "machine-learning", "learning"]
draft: false
------------

# The Future of Deep Learning Might Be Graphical

I've been thinking lately that the future of deep learning might be **graphical**.

Not just graph neural networks in the narrow sense, but something more fundamental: thinking about learning itself as a process that happens over **structure**.

Most of modern deep learning feels, in some sense, like we've found a remarkably powerful general recipe and then spent years making increasingly sophisticated variations of it.

Gradient descent.

Backpropagation.

Attention.

Different architectures, different optimizers, different regularizations, different losses.

And it works incredibly well.

But I keep wondering whether we're eventually going to need a more ingenious way of thinking about **how things learn**.

Maybe learning algorithms themselves will fall into a handful of broad structural families.

Not individual algorithms, exactly, but overarching ideas about *where information comes from, where it goes, what gets remembered, and what causes a parameter to change.*

Everything else could then become a specialization.

You could modify the regularization.

Change parameters or constants.

Add constraints.

Change the dynamics.

Introduce sparsity.

Add local signals.

Change how credit is assigned.

Change what information a node is allowed to see.

But underneath all of those modifications, perhaps there are only a few fundamental ways a system can actually learn.

And graphical systems make this way of thinking particularly interesting.

---

## Learning Through Structure

Consider a system where the architecture is itself meaningful.

Instead of having a generic dense neural network, imagine that the network is a graph representing some real structure — a brain, a physical system, a social network, a biological circuit, or even an abstract computational process.

Then the connectivity itself becomes part of the model.

You might have dynamics something like

$$
\tau_i\dot v_i
=
-v_i+
\sum_j C_{ij}w_{ij}\phi(v_j)
+
I_i(t).
$$

Here, \(C_{ij}\) describes which connections actually exist.

The graph determines the possible paths through which information can travel.

The weights determine what those paths do.

And the node dynamics determine how information changes as it moves.

Already, this feels fundamentally different from thinking about a neural network as simply a stack of matrices.

The **structure is part of the computation**.

And once you start thinking this way, the question becomes:

> How should such a structure learn?

There seem to be several very different answers.

---

## 1. Backpropagation Through a Graph

The first is the familiar one.

You can take a known graph, constrain the neural network to respect that graph, run the dynamics forward, and then simply backpropagate through the entire thing.

For example, a decoder might produce

$$
\hat y_t=D_\psi(v_t)
$$

and training could minimize

$$
\mathcal L
=
\sum_t
\|y_t-\hat y_t\|^2.
$$

Then ordinary backpropagation through time gives us

$$
\nabla_\theta\mathcal L
$$

and an optimizer such as Adam or SGD updates the parameters:

$$
\theta
\leftarrow
\theta-\eta\nabla_\theta\mathcal L.
$$

There's something almost funny about this.

You can give the model a biologically measured connectome — an incredibly complicated structure produced by evolution — and then train it using essentially the same gradient machinery we use for an ordinary deep network.

The **structure is biological**.

The **learning rule is not necessarily biological**.

And that's perfectly valid if the goal is prediction or engineering.

But it makes me wonder whether there are more interesting possibilities.

---

## 2. Local Plasticity and Modulation

A very different approach is to let the connections learn locally.

This is where ideas like KC→MBON plasticity become really interesting.

Instead of computing a giant global gradient across the entire network, a synapse can change according to information available around it.

A simplified three-factor rule might look like

$$
\Delta w_{ij}
\propto
x_i y_j d_j.
$$

You can think of these three terms as:

$$
\text{presynaptic activity}
\times
\text{postsynaptic activity}
\times
\text{dopaminergic/modulatory signal}.
$$

The important idea isn't the exact equation.

It's the **locality of the learning process**.

A particular synapse doesn't necessarily need to know what happened everywhere else in the network.

It knows something about the activity that passed through it.

Then some later signal tells it whether that activity was useful.

That is a radically different computational philosophy from ordinary backpropagation.

---

## 3. Eligibility Traces

Then there is another family that I find particularly fascinating: **eligibility traces**.

The basic intuition is wonderfully simple.

A synapse doesn't immediately know whether something it just did was good or bad.

So it leaves behind a little trace.

Something like:

> *This synapse was involved in what just happened.*

That trace can persist for a while.

Then, when a reward or error signal eventually arrives, the system can use that trace to determine which synapses should change.

Mathematically, you might have something resembling

$$
\Delta w_{ij}(t)
=
-\eta L_j(t)e_{ij}(t),
$$

where \(e_{ij}(t)\) is the eligibility trace and \(L_j(t)\) is some later learning or modulatory signal.

Conceptually:

$$
\boxed{
\text{weight change}
=
\text{local history}
\times
\text{eligibility}
\times
\text{teaching signal}
}
$$

This is interesting because it provides a possible answer to one of the hardest problems in biological learning:

**credit assignment through time.**

Instead of remembering the entire computational history and then running backpropagation through it, the system continuously carries forward a compressed memory of what each synapse recently contributed.

---

## 4. Approximating the Gradient Locally

There are also approaches like BrainTrace and related methods that try to approximate recurrent gradients without explicitly storing the entire temporal computation graph.

Instead of BPTT saying:

> Remember everything, go all the way back, and calculate the gradient.

the system maintains traces that evolve online.

For example,

$$
\epsilon_{x,t}
=
\alpha\epsilon_{x,t-1}
+
x_t.
$$

Other traces can track how the network's dynamics affect its parameters.

Then the eventual gradient can be approximated from these continuously maintained quantities.

The deeper idea is what matters to me:

**Can a system perform something gradient-like without actually performing conventional backpropagation?**

If the answer is yes, then we suddenly have a much larger design space for learning algorithms.

---

# Maybe These Are Families, Not Algorithms

This is the part I keep coming back to.

Mathematically, these methods seem to fall into a few fairly distinct families.

You could have:

**Global gradient-based learning**

$$
\text{network}
\rightarrow
\text{global loss}
\rightarrow
\text{backpropagation}
\rightarrow
\text{parameter updates}
$$

or:

**Local plasticity**

$$
\text{local activity}
+
\text{local state}
+
\text{modulation}
\rightarrow
\Delta w
$$

or:

**Eligibility-based learning**

$$
\text{local history}
\rightarrow
\text{eligibility trace}
\rightarrow
\text{later teaching signal}
\rightarrow
\Delta w.
$$

And there could be other fundamental families that we haven't properly identified yet.

Within each family, though, there can be an enormous number of variations.

Regularization.

Constraints.

Different time constants.

Different nonlinearities.

Different modulatory signals.

Different parameterizations.

Different optimization schemes.

Different ways of propagating information.

Different graph structures.

Different ways of storing state.

All of these can produce dramatically different systems while still belonging to the same underlying structural idea.

I think that's an interesting way to classify learning algorithms.

Not by the name of the paper.

Not by the optimizer.

Not by the architecture.

But by **the mechanism through which information causes a parameter to change**.

---

# And This Is Where Graphs Become Interesting

A graphical network gives us a natural language for expressing all of this.

Nodes have states.

Edges have parameters.

Information flows along edges.

Local interactions produce local consequences.

Global signals can modulate local behavior.

The structure determines what information can reach what.

And learning can happen at multiple levels.

Maybe the future isn't simply about making neural networks bigger.

Maybe it is about making the **rules governing information flow and learning more expressive**.

A sufficiently interesting graph could encode a surprising amount of prior knowledge.

A sufficiently interesting learning rule could exploit that structure without destroying it.

And perhaps a sufficiently general framework could let us describe biological learning, artificial neural networks, dynamical systems, and other computational processes using the same mathematical language.

That would be much more interesting to me than simply finding another optimizer.

---

## The Bigger Question

Maybe the real question isn't:

> *What is the next neural network architecture?*

Maybe it's:

> **What are the fundamental ways a system can learn?**

Once we have a good answer to that, architectures become implementations.

Regularization becomes a modification.

Constraints become structure.

Hyperparameters become choices within a family.

And entirely new algorithms become variations on a small number of deeper principles.

I don't know yet whether graphical networks are actually the future of deep learning.

But the more I think about learning as something that happens **over structure**, rather than merely something that happens *inside a network*, the more compelling the idea becomes.

Maybe intelligence isn't just about having more parameters.

Maybe it's about understanding **how information, structure, memory, and consequence interact**.

And maybe the next generation of learning algorithms will come from that direction.
