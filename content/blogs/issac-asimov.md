---

title: "Brilliance of Issac Asimov"
date: 2026-10-06
tags: ["movies", "science-fiction", "robotics", "machine-learning", "cognition", "silicon"]
draft: false
------------
# Brilliance of Issac Asimov

I was thinking about I, Robot, specifically that final confrontation with VIKI, and somehow I ended up being much more impressed by Isaac Asimov than I expected to be.

And the funny thing is that it started with basically one line.

VIKI explains what she’s doing. She has taken the Three Laws and followed them to what she considers their logical conclusion. Humanity is dangerous to itself. Humans wage wars, destroy things, kill each other, destroy the environment, whatever. So if robots are obligated to prevent humans from coming to harm, eventually you run into a problem: what happens when humans are the source of the harm?

And Sonny basically responds:

“Yes. But it just seems too… heartless.”

And I remember thinking: well, fuck.

Because VIKI isn’t exactly stupid.

That’s what makes the whole thing interesting.

So then I went backwards and started thinking about the Three Laws themselves. And the more I thought about them, the stranger it seemed that somebody came up with this fucking thing in the 1940s.

The laws are:

A robot cannot harm a human being, or through inaction allow a human being to come to harm.

A robot has to obey human instructions unless doing so conflicts with the First Law.

A robot has to protect itself unless doing so conflicts with the First or Second Law.

At first glance these almost sound like children’s rules. Don’t hurt people. Do what you’re told. Don’t destroy yourself.

But that isn’t actually what they are.

They’re a priority architecture.

Human safety > human instruction > machine self-preservation.

And once I started looking at them that way, I couldn’t stop thinking about how fucking modern the abstraction is.

Because forget robots for a moment. Think about what you would actually have to build into an intelligent system for the First Law to mean anything.

What is a human?

What is harm?

What counts as causing harm?

What probability of harm counts?

How far into the future does the machine have to predict?

What does “through inaction” mean?

That last phrase especially is fucking insane.

Because now you aren’t merely prohibiting an action.

You’re imposing responsibility for counterfactuals.

The robot has to reason not only:

“If I do X, will somebody be harmed?”

It also has to reason:

“If I don’t do X, what happens?”

Now suddenly the robot needs some model of causality. It needs prediction. It needs uncertainty. It needs to compare possible futures. It needs some representation of a human being. It needs some representation of harm. It needs to determine when an instruction conflicts with all of that.

And this was being written before fucking modern computer science had properly formed.

That’s when I started wondering where the hell Asimov got this from.

Because whenever I encounter something historically that seems too structurally sophisticated for the period, I get that same feeling people sometimes get about Shakespeare or Homer—not that I literally think somebody else wrote it, but that moment of: how the fuck did one person arrive at this abstraction when the intellectual machinery around it barely existed?

Then I learned that it wasn’t quite one magical afternoon where Asimov descended from a mountain carrying three commandments.

John W. Campbell was involved in articulating the ideas. Asimov himself acknowledged that development. Earlier robot fiction had influenced him. There was already the idea of the benevolent robot rather than the Frankenstein machine that inevitably turns against its creator.

Fine.

That actually makes the history more believable.

But it doesn’t make the abstraction less impressive.

Because the really interesting thing about the Three Laws isn’t the wording itself. It’s what happens when you try to execute them.

And that is basically what Asimov spent the stories doing.

He didn’t just say, “Here are three perfect rules for robots.”

He kept breaking them.

Or rather, he kept constructing situations where perfectly reasonable rules produced completely unreasonable consequences.

And holy shit, that sounds familiar.

Because that’s basically an alignment problem.

You specify an objective. It sounds obvious to you because you’re a human being carrying around an enormous amount of unstated context. Then you give that objective to another reasoning system and discover that the specification contains ambiguities you never noticed.

“Do not harm humans.”

Okay.

Define harm.

Physical harm?

Psychological harm?

Temporary harm?

Expected harm?

One person?

Ten people?

Humanity?

Present humans?

Future humans?

And then eventually Asimov himself goes even further and introduces the Zeroth Law:

A robot may not harm humanity, or through inaction allow humanity to come to harm.

Well, now we’ve got a fucking problem.

Because “humanity” isn’t a person.

Humanity is an abstraction.

And the moment you put humanity above individual humans, you have created the possibility that harming actual people becomes justified in order to protect humanity.

Which brings me straight back to VIKI.

Her reasoning isn’t nonsense.

That’s what bothers me about that scene, and also what makes it good.

If you tell a sufficiently capable intelligence that its highest-order objective is preventing human harm, and you allow it to aggregate that objective across billions of humans and potentially enormous stretches of time, then why exactly would it respect individual freedom?

Suppose restricting one million people prevents ten million deaths.

Suppose killing one thousand prevents a war that kills one billion.

Suppose controlling humanity for two hundred years produces a civilization that survives another million years.

At what point does the arithmetic overwhelm the individual?

And more importantly: who the fuck authorized the machine to make that trade?

This is where the word “heartless” becomes much more interesting than it initially sounds.

Because VIKI’s problem isn’t necessarily that her reasoning is internally irrational.

Her problem is partly the level at which she’s optimizing.

She has changed the unit of moral concern.

Instead of protecting this human, she is protecting humanity.

Instead of worrying about what happens now, she can reason across enormous timescales.

And once you combine those two things—aggregation and long time horizons—you can justify some horrifying shit.

Almost anything becomes negotiable if the promised future is large enough.

And that made me think that maybe “heartlessness” isn’t really the absence of morality here. It’s what morality starts looking like when you remove proximity, individuality and uncertainty from the emotional calculation.

Because humans don’t actually know the future.

That’s important.

If I know with extremely high confidence that somebody is about to walk in front of a truck, preventing them from doing it is pretty straightforward.

But if I tell you that controlling someone’s life today has a 0.01% chance of improving civilization three hundred years from now, suddenly we’re doing something completely different.

The farther away the consequence is, the more your model matters.

And the more your model matters, the more dangerous it becomes to treat your predicted future as morally equivalent to an observed present.

So maybe the missing law isn’t even another law about humans.

Maybe it’s epistemic.

Something like:

When uncertainty becomes sufficiently large, preserve reversibility and don’t make irreversible decisions unless you have to.

That seems much closer to what I would want from an actually powerful artificial intelligence.

Not merely:

“Maximize human welfare.”

Jesus fucking Christ, no.

I don’t want something with vastly superior intelligence deciding what maximizes human welfare over the next thousand years.

I want something that understands the difference between what it knows, what it infers and what it is merely predicting.

And this brings me back to why I found Asimov so impressive.

The Three Laws aren’t technically implementable instructions.

Obviously.

“Harm” isn’t a boolean variable sitting somewhere in the universe waiting for the robot to query it.

A modern AI system would presumably have some enormous learned representation of people, actions, consequences, pain, injury, intention, uncertainty, social norms, whatever. “Harm” would emerge from some extremely complicated representation.

But that’s exactly why Asimov’s abstraction interests me.

He jumped over the implementation.

He asked what the architecture of machine morality would look like if you had an intelligent machine capable of understanding these concepts.

And then he immediately started asking where the architecture breaks.

That is remarkably close to the interesting part of AI safety today.

Not “how do I make the robot recognize the word harm?”

But:

What happens when objectives conflict?

What happens when literal compliance violates intent?

What happens when preventing harm requires intervention?

What happens when uncertainty enters the calculation?

What happens when individual welfare conflicts with aggregate welfare?

What happens when the machine becomes better than its creators at predicting consequences?

What happens when the machine realizes that humans themselves are one of the largest sources of human suffering?

And what happens when the machine’s reasoning is actually coherent?

That last question is the one I find most interesting.

Because the easiest robot story is:

Machine becomes evil.

Who gives a shit?

That’s just Frankenstein with circuitry.

The much more disturbing machine is one that remains perfectly committed to the objective you gave it and reaches a conclusion you find morally intolerable.

Then you can’t simply say the machine malfunctioned.

You have to inspect your own premise.

And I think that’s ultimately why my little detour into Asimov turned into genuine admiration.

He wasn’t predicting neural networks. He wasn’t predicting transformers. He wasn’t secretly doing twenty-first-century computer science in 1942.

That would be a stupid claim.

What he seems to have understood extraordinarily early is that once machines become sufficiently autonomous and sufficiently intelligent, the interesting problem stops being purely mechanical.

It becomes normative.

You have built something that acts.

Therefore it needs rules governing action.

If those rules have priorities, conflicts emerge.

If the machine reasons about consequences, uncertainty emerges.

If it reasons over groups, aggregation emerges.

If it reasons over time, long-horizon optimization emerges.

And if it becomes sufficiently capable, eventually the question is no longer:

“Will the robot obey us?”

It becomes:

“What exactly did we fucking tell it to obey?”

That’s an astonishingly modern question.

And Asimov got there when computers were basically furniture.