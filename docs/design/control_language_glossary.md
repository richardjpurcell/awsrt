# AWSRT Control Language Glossary

**Status:** Working glossary note  
**Applies to:** AWSRT control-facing writing, design notes, results writing, figure captions, and discussion of operational behavior  
**Purpose:** Establish a stable language discipline for discussing AWSRT control work so that usefulness-layer terms and regime-layer terms are not accidentally mixed or treated as interchangeable.

---

## 1. Purpose of this note

This note defines a control-language discipline for AWSRT.

Its purpose is simple:

- reduce ambiguity when discussing control behavior,
- distinguish clearly between different control layers,
- stabilize the wording used in design notes and results writing,
- and make it easier to tell, at any given moment, which part of the control stack is being discussed.

This is needed because AWSRT now has more than one operational-control surface, and some of the state terms can sound similar if the layer is not named explicitly.

The goal is not to create artificial jargon.  
The goal is to make the existing language more readable and more disciplined.

---

## 2. Core recommendation

The main rule is:

> always name the control layer first, then name the state, signal, or transition within that layer.

This avoids the most common source of confusion, which is using a state word without making clear which controller surface it belongs to.

For example:

- **good:** “the usefulness layer becomes caution-dominated”
- **good:** “the active regime layer remains nominal”
- **bad:** “the controller goes into caution/downshift”

The last phrasing is unclear because it mixes state words from different layers without naming the layer.

---

## 3. The two main operational-control layers

At the current AWSRT stage, the main operational-control story has **two different layers**.

### 3.1 Usefulness layer

This is the compact usefulness-controller surface.

It is the layer organized around the triad:

- exploit
- recover
- caution

This layer is best understood as the compact information-health or usefulness-facing control layer.

### 3.2 Regime layer

This is the broader regime-managed control surface.

It includes:

- advisory regime semantics,
- active realized regime behavior,
- regime-family structure,
- and the nominal / downshift / certified active-state reading.

This layer is best understood as the higher-level deployment-control layer.

---

## 4. Recommended umbrella names

For everyday writing, the following shorter names are recommended.

### 4.1 Recommended short names

- **usefulness layer**
- **regime layer**

These are clearer and more reusable than repeating the full long-form descriptions every time.

### 4.2 Recommended longer names when precision is needed

- **compact usefulness layer**
- **regime-managed control layer**
- **advisory regime layer**
- **active regime layer**

These longer forms are useful when a paragraph is specifically about advisory versus active distinctions inside regime management.

---

## 5. Usefulness-layer vocabulary

The usefulness layer should use a **strict and limited vocabulary**.

### 5.1 Main usefulness states

The usefulness layer uses only these three main state terms:

- **exploit**
- **recover**
- **caution**

These should be referred to collectively as:

- **the usefulness triad**

### 5.2 Recommended usefulness-layer phrases

Recommended phrases include:

- usefulness layer
- usefulness state
- usefulness triad
- usefulness transition
- usefulness reading
- usefulness-dominated run
- usefulness-facing interpretation

### 5.3 Recommended examples

Good examples:

- “The usefulness layer is exploit-dominated.”
- “The usefulness layer shifts into recover under staleness.”
- “The usefulness triad becomes caution-heavy on the corruption side.”
- “This run has a caution-dominated usefulness reading.”

### 5.4 Terms to avoid in usefulness writing

Avoid using regime-layer terms to describe usefulness-layer behavior.

For example, avoid saying:

- “the usefulness controller downshifts”
- “the usefulness controller becomes nominal”
- “the usefulness controller enters certified”

Those are regime-layer words, not usefulness-layer words.

---

## 6. Regime-layer vocabulary

The regime layer should use a different vocabulary from the usefulness layer.

### 6.1 Main regime-layer terms

The regime layer is discussed using these umbrella terms:

- advisory regime
- active regime
- regime family
- regime transition
- regime mechanism
- regime behavior

### 6.2 Main active regime states

The active regime layer should use the following state vocabulary:

- **nominal**
- **downshift**
- **certified**

These are the main realized active-regime states that should be used in operational interpretation.

### 6.3 Recommended regime-layer phrases

Recommended phrases include:

- active regime layer
- advisory regime layer
- realized active state
- regime transition
- active downshift
- certified entry
- certified residence
- leave-certified behavior
- regime-family behavior
- active regime occupancy

### 6.4 Recommended examples

Good examples:

- “The active regime layer remains too nominal.”
- “The regime layer does not produce enough visible downshift.”
- “Certified entry occurs, but certified residence is short.”
- “The opportunistic family shows some downshift but insufficient sustained non-nominal behavior.”
- “The advisory regime recommends stronger intervention than the active regime realizes.”

### 6.5 Terms to avoid in regime writing

Avoid using usefulness-layer state words as though they were active regime states.

For example, avoid saying:

- “the active regime becomes caution”
- “the active regime moves into exploit”
- “the regime controller is recover-dominated”

Those belong to the usefulness layer, not the regime layer.

---

## 7. Advisory versus active regime language

Within the regime layer itself, there is another important distinction:

- **advisory regime**
- **active regime**

These should be kept separate.

### 7.1 Advisory regime

Advisory regime language refers to recommendation-side or interpretation-side regime outputs.

Recommended phrases:

- advisory regime summary
- advisory trigger hit
- advisory state suggestion
- advisory certified stage
- advisory regime reading

### 7.2 Active regime

Active regime language refers to realized applied behavior.

Recommended phrases:

- active regime summary
- active realized state
- active transition count
- active occupancy
- active certified residence
- active downshift behavior

### 7.3 Recommended sentence pattern

A very useful sentence pattern is:

> “The advisory regime indicates X, but the active regime realizes Y.”

Examples:

- “The advisory regime indicates stronger intervention pressure, but the active regime remains nominal.”
- “The advisory regime shows certified-side pressure, but the active regime realizes only brief certified residence.”

This is one of the clearest ways to preserve the v0.2 semantic discipline.

---

## 8. Recommended reserved terms

To reduce confusion, certain words should be treated as **reserved for one layer only**.

### 8.1 Reserve for usefulness layer only

Use the following only for the usefulness layer:

- exploit
- recover
- caution
- usefulness triad
- usefulness state
- usefulness-dominated
- usefulness transition

### 8.2 Reserve for regime layer only

Use the following only for the regime layer:

- nominal
- downshift
- certified
- advisory
- active
- opportunistic
- balanced
- certified-heavy
- certified entry
- certified residence
- leave-certified

This is one of the most important discipline rules in the note.

---

## 9. Recommended cross-layer interpretation language

One of the most important AWSRT interpretations now involves the relationship between the two layers.

This is where the language most often becomes muddy.

### 9.1 Recommended cross-layer template

Use the following kind of sentence:

> “The usefulness layer reads as degraded, but the active regime layer remains too nominal.”

This is a very strong template because it explicitly names both layers and makes their relation readable.

### 9.2 Other useful cross-layer examples

- “The usefulness layer moves toward caution, but the regime layer does not yet show visible downshift.”
- “The usefulness reading suggests degraded information conditions, while the active regime remains largely nominal.”
- “The usefulness layer is readable, but the regime layer is not yet responding strongly enough.”

These are especially useful for v0.4 discussion.

---

## 10. Suggested operational meanings of the two layers

To keep the two layers conceptually distinct, the following working interpretation is recommended.

### 10.1 Usefulness layer

The usefulness layer answers the question:

> what kind of information-health or usefulness condition are we currently in?

This is why exploit / recover / caution belong here.

### 10.2 Regime layer

The regime layer answers the question:

> what operational deployment posture should the system realize?

This is why nominal / downshift / certified belong here.

This is not a perfect implementation-level statement in every detail, but it is the clearest working scientific language.

---

## 11. Recommended sentence templates

The easiest way to stay consistent is to reuse a small set of sentence templates.

### 11.1 Usefulness-layer templates

- “In the usefulness layer, the run is exploit-dominated.”
- “In the usefulness layer, the run shifts toward recover.”
- “The usefulness triad becomes caution-heavy under corruption.”
- “This is a caution-dominated usefulness reading.”

### 11.2 Regime-layer templates

- “In the active regime layer, the run remains nominal.”
- “The regime layer shows only limited downshift.”
- “Certified entry occurs, but certified residence remains brief.”
- “The opportunistic regime family is more active than the balanced family.”

### 11.3 Advisory-versus-active templates

- “The advisory regime indicates intervention pressure, but the active regime remains nominal.”
- “Advisory and active regime surfaces should not be read interchangeably.”
- “The advisory reading is stronger than the realized active behavior.”

### 11.4 Cross-layer templates

- “The usefulness layer reads as degraded, but the active regime layer does not yet respond strongly.”
- “The usefulness reading is caution-leaning, while the regime layer remains mostly nominal.”
- “The usefulness layer is readable on this slice, but the regime layer still lacks visible downshift.”

---

## 12. Practical glossary entries

A shorter glossary section for reuse in future notes could read as follows.

### 12.1 Usefulness layer
Compact control/interpretation layer organized around the usefulness triad: exploit, recover, and caution.

### 12.2 Usefulness triad
The three usefulness-layer states: exploit, recover, caution.

### 12.3 Exploit
Healthy or strongly useful-information reading in the usefulness layer.

### 12.4 Recover
Staleness-weakened or partially degraded usefulness reading in the usefulness layer.

### 12.5 Caution
Corruption-severe or strongly degraded usefulness reading in the usefulness layer.

### 12.6 Regime layer
Higher-level regime-managed deployment-control layer.

### 12.7 Advisory regime
Recommendation-side regime output; not realized control by itself.

### 12.8 Active regime
Realized applied deployment behavior.

### 12.9 Nominal
Ordinary active-regime operating posture.

### 12.10 Downshift
Reduced or guarded active-regime posture short of certified fallback.

### 12.11 Certified
Stronger certified-descent or certified-fallback regime posture.

### 12.12 Regime family
A regime-management family such as balanced, opportunistic, or certified-heavy.

---

## 13. Recommended usage rule for future writing

Before using any control-state word, ask:

> is this a usefulness-layer state or a regime-layer state?

If the sentence does not make that clear, revise the sentence.

That simple rule will prevent most ambiguity.

---

## 14. Recommendation for future notes and chapters

This glossary should be treated as a working writing aid, not as a frozen doctrinal document.

It is especially useful to apply it in:

- v0.4 design notes,
- results-section drafts,
- figure captions,
- figure scripts and figure naming,
- and thesis-facing synthesis writing.

A good practice would be:

- include a short version of this distinction in major control-facing notes,
- especially when both usefulness and regime management are discussed in the same document.

---

## 15. Short summary

AWSRT now has more than one control-facing operational layer, so writing discipline matters. The central recommendation of this note is to always name the control layer first and then name the state within that layer. The **usefulness layer** uses the triad **exploit / recover / caution** and should be discussed as a compact usefulness-facing control or interpretation layer. The **regime layer** uses the vocabulary **nominal / downshift / certified** and should be discussed as the broader regime-managed deployment-control layer, with advisory and active semantics kept distinct. The most important practical rule is to avoid mixing these vocabularies in a single sentence without naming the layer explicitly.