---
title: "Curve fitting in Flow Studio: 66 years of CO₂ in five parameters"
description: "The new curve-fitting plugin fits models to measurements, reports every parameter with its uncertainty, plots the residuals and shows its work as plain Python. Here it is on the Mauna Loa CO₂ record."
pubDate: "2026-10-31"
heroImage: "/img/curvefit-co2-flow.webp"
---

Fitting a formula to measurements is the everyday work of a lab: decay curves, reaction rates, calibration lines, resonance peaks. The usual tools are a spreadsheet trend line that gives no uncertainties, or a script that only its author can follow.

Flow Studio 1.28 adds a curve-fitting plugin. You pick the columns and a model in a form. You get every parameter with its standard error, a plot of the fit with its residuals, and the whole calculation as plain Python you can read. It's built on [lmfit](https://lmfit.github.io/lmfit-py/).

## Enable it

**Docker.** It's included in the images by default, so if you run Flow Studio 1.28 in Docker you already have it. (The `SFS_PLUGINS` setting in `.env` lists the plugins baked into the image; the default is `curvefit`.)

**Running locally.** Install it into the environment Flow Studio runs in and restart the backend:

```bash
pip install -e plugins/sfs-plugin-curvefit
```

You'll see two new engines in the processor's engine picker, **Curve fit** and **Evaluate model**, and a new chart template.

## The quickest start

Open the project picker. Under **Start from an example** there are two ready-made projects: radioactive decay (counts with √N errors, ending with the half-life and its error) and enzyme kinetics (a Michaelis–Menten fit). Pick one, click **Run Flow**, and open the Fit plot node.

## Your own fit: the Keeling curve

For a real dataset, take the most famous curve in climate science: the monthly mean CO₂ concentration measured at Mauna Loa, Hawaii, since 1958. NOAA makes it freely available as a CSV, so a processor node can read it straight from the web:

```python
# Monthly mean CO2 at Mauna Loa, Hawaii (NOAA Global Monitoring Laboratory)
url = "https://gml.noaa.gov/webdata/ccgg/trends/co2/co2_mm_mlo.csv"
df = pd.read_csv(url, comment="#")

df["t"] = df["decimal date"] - 1960          # years since 1960
df = df[["t", "average"]].rename(columns={"average": "co2"})
```

That's 823 months. The curve has two obvious features, a rising trend that is curving upwards and a yearly cycle as northern forests grow and shed their leaves. So the model is a quadratic plus one sine wave per year:

```text
a + b*t + c*t^2 + A*sin(2*pi*t) + B*cos(2*pi*t)
```

Add a processor, pick the **Curve fit** engine, and fill in the form:

- **x column:** `t`, **y column:** `co2`
- **Model:** *Custom expression…*, with the expression above and `t` as the variable

Custom expressions are checked as you'd hope: unknown functions are reported by name, and `^` works as a power. Built-in models cover the common cases, grouped by field: linear and polynomial, exponential decay and growth, power law, logistic, Gaussian, Lorentzian, Voigt, damped oscillation, Arrhenius, Michaelis–Menten and Hill. Those guess their own starting values.

The output is a single table: each parameter with its standard error, then χ², reduced χ², r² and the number of points. Because it's an ordinary table, the next node can use it.

## See the fit

Two more nodes finish the picture. An **Evaluate model** node connected to the fit draws the smooth curve: set Mode to *Range*, from −2 to 67 years. Then a **Chart View** connected to the data, the fit and the curve, with **Start from a template → Fit with residuals**. The order you connect them in doesn't matter: the chart tells them apart by their columns.

![The fit: data, fitted curve and parameters on top, residuals underneath](/img/curvefit-co2-chart.webp)

The template is only a starting point, and the code is yours once inserted. With 823 points the markers hid the curve, so I made them smaller and moved the parameter box to the left: two lines of matplotlib.

## Reading the result

The trend parameters translate directly into physics. Atmospheric CO₂ was rising by **b = 0.796 ± 0.007 ppm per year** in 1960. The growth rate is the slope b + 2ct, so with c = 0.01348 ± 0.0001 it is about **2.6 ppm per year** today. The seasonal amplitude, √(A² + B²), gives a swing of about **5.7 ppm** from the spring peak to the autumn low. A small pandas node after the fit computes these from the parameter table, so they update whenever the data do.

The residual panel is where the honesty is. The fit explains 99.9 % of the variance, but the residuals aren't random noise: they wander up and down over several years. That's real signal the five-parameter model doesn't include. Year-to-year changes in CO₂ growth are known to follow events such as El Niño and the 1991 eruption of Mount Pinatubo. A trend line alone would never show it.

Two notes on uncertainties. These data come without an error column, so the parameter errors are scaled by the scatter about the fit. When your measurements do have uncertainties, choose that column as **y error column**. Points are then weighted by 1/σ, the errors are absolute, and the reduced χ² tells you whether your stated errors and the scatter agree.

## View as Python

Every node built this way has a **View as Python** button. It shows the same calculation as plain lmfit and NumPy, commented step by step, with no dependency on the plugin. The model function in it is the exact source the engine runs, so the code produces the same table. **Convert to code node** turns the node into that code, ready to edit.

![View as Python: the fit written out as plain lmfit code](/img/curvefit-python.webp)

This is the part I care about most for teaching. A student can do the fit with the form on day one, open the code to see what it did, and on day two change the code instead of the form.

## Also in the plugin

- **Evaluate model** in *Columns* mode computes a formula over your rows and propagates uncertainty columns (`<name>_err`) into the result. For example, `m*g*h` over measured masses and heights, with their errors.
- Fits that fail say what to try, for example "supply initial guesses for tau".
- Custom expressions are validated, not sandboxed: like all Flow Studio node code, they run with the backend's privileges.

The [user guide](https://github.com/sidewinder-labs/sidewinder-flow-studio/blob/main/docs/CURVE_FITTING.md) covers every model and option. If you teach a lab course and try it with your students, I'd like to hear how it goes.

→ [Flow Studio on GitHub](https://github.com/sidewinder-labs/sidewinder-flow-studio)

*Data: NOAA Global Monitoring Laboratory, [gml.noaa.gov/ccgg/trends](https://gml.noaa.gov/ccgg/trends/). Measurements from March 1958 to April 1974 by C. David Keeling, Scripps Institution of Oceanography.*
