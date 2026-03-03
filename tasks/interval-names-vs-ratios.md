# Why Interval Names Don't Match Their Frequency Ratios

## The Apparent Paradox

| Interval       | Name number | Ratio         | Ratio numbers |
|----------------|-------------|---------------|---------------|
| Octave         | 8           | $$2:1$$       | 2, 1          |
| Perfect fifth  | 5           | $$3:2$$       | 3, 2          |
| Perfect fourth | 4           | $$4:3$$       | 4, 3          |
| Major third    | 3           | $$5:4$$       | 5, 4          |

The bigger the interval name, the simpler the ratio. The numbers almost look inverted:
"fifth" has $$3$$ in its ratio, "third" has $$5$$.

## Two Independent Numbering Systems

### System 1: Names (scale step counting)

Names come from counting positions in the **diatonic scale** using inclusive ordinal counting.
This is a Western music convention rooted in medieval Latin terminology.

- C to C = 1 note = unison
- C to D = 2 notes = second
- C to E = 3 notes = **third**
- C to F = 4 notes = **fourth**
- C to G = 5 notes = **fifth**
- C to A = 6 notes = sixth
- C to B = 7 notes = seventh
- C to C' = 8 notes = **octave** (Latin "octavus" = eighth)

### System 2: Ratios (harmonic series / physics)

Ratios come from the **harmonic series** — the natural overtones of a vibrating string or air column.

A string vibrating at fundamental frequency $$f_1$$ simultaneously produces overtones at integer multiples:

$$f_n = n \cdot f_1$$

| Harmonic | Frequency | Interval above fundamental |
|----------|-----------|----------------------------|
| $$n = 1$$ | $$f_1$$     | fundamental              |
| $$n = 2$$ | $$2f_1$$    | 1 octave                 |
| $$n = 3$$ | $$3f_1$$    | 1 octave + perfect fifth |
| $$n = 4$$ | $$4f_1$$    | 2 octaves                |
| $$n = 5$$ | $$5f_1$$    | 2 octaves + major third  |
| $$n = 6$$ | $$6f_1$$    | 2 octaves + perfect fifth|

The frequency ratios between consecutive harmonics produce intervals:

$$\frac{H_2}{H_1} = \frac{2}{1} \quad \Rightarrow \quad \text{octave}$$

$$\frac{H_3}{H_2} = \frac{3}{2} \quad \Rightarrow \quad \text{perfect fifth}$$

$$\frac{H_4}{H_3} = \frac{4}{3} \quad \Rightarrow \quad \text{perfect fourth}$$

$$\frac{H_5}{H_4} = \frac{5}{4} \quad \Rightarrow \quad \text{major third}$$

## Why They Run in Opposite Directions

The harmonic series gets **denser** as you go higher. The musical distance between consecutive
harmonics **shrinks**:

$$\frac{H_2}{H_1} = \frac{2}{1} = 1200 \text{ cents (octave — huge gap)}$$

$$\frac{H_3}{H_2} = \frac{3}{2} = 702 \text{ cents (fifth — large gap)}$$

$$\frac{H_4}{H_3} = \frac{4}{3} = 498 \text{ cents (fourth — medium gap)}$$

$$\frac{H_5}{H_4} = \frac{5}{4} = 386 \text{ cents (major third — smaller gap)}$$

$$\frac{H_6}{H_5} = \frac{6}{5} = 316 \text{ cents (minor third — even smaller)}$$

$$\frac{H_7}{H_6} = \frac{7}{6} = 267 \text{ cents (keeps shrinking...)}$$

The general formula for cents between consecutive harmonics:

$$c(n) = 1200 \cdot \log_2\!\left(\frac{n+1}{n}\right)$$

As $$n \to \infty$$, the interval $$c(n) \to 0$$. The series converges — gaps shrink monotonically.

So **simpler ratios** (lower harmonic numbers) correspond to **larger intervals** (more scale steps).
And **more complex ratios** (higher harmonic numbers) correspond to **smaller intervals** (fewer scale steps).

This is why the two numbering systems appear inverted. They are counting fundamentally
different things:

- **Names** count horizontal distance along a scale (a cultural artifact)
- **Ratios** reflect vertical position in the harmonic series (a physical property)

## Why Simpler Ratios Sound More Consonant

The human ear perceives intervals with simpler ratios as more consonant (stable, resolved)
because the waveforms align more frequently. At a $$2:1$$ ratio, every second cycle of the
higher note coincides with the lower note. At $$3:2$$, every third cycle aligns with every
second. The simpler the ratio, the more regularly the waves reinforce each other.

The "coincidence rate" for a ratio $$\frac{a}{b}$$ (in lowest terms) is:

$$\text{coincidence} = \frac{1}{\text{lcm}(a, b)}$$

| Ratio   | $$\text{lcm}$$ | Coincidence | Perceived consonance |
|---------|-----------------|-------------|----------------------|
| $$2:1$$ | 2               | highest     | perfect              |
| $$3:2$$ | 6               | high        | perfect              |
| $$4:3$$ | 12              | moderate    | perfect              |
| $$5:4$$ | 20              | lower       | imperfect consonance |
| $$9:8$$ | 72              | low         | dissonance           |

This is why the octave and fifth have been recognized as "perfect" consonances across
virtually all musical traditions, while the third was considered dissonant in medieval
Europe (before the Renaissance embraced thirds as consonant).
