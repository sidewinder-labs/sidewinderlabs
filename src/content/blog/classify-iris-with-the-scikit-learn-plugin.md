---
title: "Classifying iris flowers with the scikit-learn plugin"
description: "Install the scikit-learn plugin for Flow Studio and train a classifier on the iris dataset, first from a form, then in a few lines of code."
pubDate: "2026-10-31"
heroImage: "/img/sklearn-iris-form.webp"
---

Flow Studio's engine list is open: a plugin is an ordinary Python package that adds an engine to the picker. The scikit-learn plugin is the reference example. It turns a processor node into a place to train models on whatever flows into it.

This post installs it and builds a small classification flow on the iris dataset, which ships with scikit-learn: 150 flowers of three species, each measured four ways. There's nothing to download.

## Install the plugin

**Docker.** The images install the plugins named in `SFS_PLUGINS`. In the repository's `.env` file (copied from `.env.docker`), add `sklearn` to the list:

```bash
SFS_PLUGINS=curvefit,sklearn
```

Then rebuild the backend:

```bash
docker compose build --no-cache backend
docker compose up -d
```

**Running locally.** Install the package into the environment Flow Studio runs in, then restart the backend:

```bash
pip install -e plugins/sfs-plugin-sklearn
```

Either way, the engine picker now shows **scikit-learn** with a 🧩 badge. It has no frontend code of its own: the plugin declares its form fields and the interface draws them.

## Load the flowers

Create a project, add a **Processor** after the trigger, and give it this code (pandas engine):

```python
# The iris dataset ships with scikit-learn: 150 flowers, 3 species
from sklearn.datasets import load_iris

iris = load_iris(as_frame=True)
df = iris.frame.rename(columns={
    "sepal length (cm)": "sepal_length", "sepal width (cm)": "sepal_width",
    "petal length (cm)": "petal_length", "petal width (cm)": "petal_width",
})
df["species"] = iris.target_names[df.pop("target")]
```

Run the flow and click the node: 150 rows, four measurements and a `species` column.

## A model without code

Add another processor after it and pick the **scikit-learn** engine. Leave the code cell empty and fill in the form:

- **Target column:** `species`
- **Model:** `rf_classifier` (a random forest)
- **Test size:** `0.3`

Run it. The node holds out 30 % of the flowers, trains on the rest and adds a `prediction` column to every row. Its accuracy on the held-out flowers is printed to the backend log (`docker compose logs backend`):

```text
metrics: {'model': 'rf_classifier', 'accuracy': 1.0, 'f1_weighted': 1.0, 'n_train': 105, 'n_test': 45, ...}
```

A perfect score looks great, but it's worth a second look.

## The same idea, in code

The form is a shortcut for the common case. When you want control, write the code in the same node: `train_test_split`, `np` and scikit-learn are already available. This version splits so that each species is equally represented, and keeps only the flowers the model has never seen:

```python
# Train on 70 % of the flowers, predict the 30 % the model has never seen
from sklearn.ensemble import RandomForestClassifier

features = ["sepal_length", "sepal_width", "petal_length", "petal_width"]
train, test = train_test_split(df, test_size=0.3, random_state=42, stratify=df["species"])

model = RandomForestClassifier(random_state=42).fit(train[features], train["species"])
df = test.assign(prediction=model.predict(test[features]))
```

As in every node, whatever is left in `df` flows downstream: here, the 45 test flowers with their predictions. Two small nodes after it make the result easy to read. A pandas node builds the confusion matrix:

```python
# Rows are the true species, columns the predictions
df = pd.crosstab(df["species"], df["prediction"]).reset_index()
```

| species | setosa | versicolor | virginica |
|---|---|---|---|
| setosa | 15 | 0 | 0 |
| versicolor | 0 | 14 | 1 |
| virginica | 0 | 4 | 11 |

And a **Chart View** node plots the test flowers by petal size, with the mistakes circled:

```python
import matplotlib.pyplot as plt

fig, ax = plt.subplots(figsize=(8, 5))
for species, group in df.groupby("species"):
    ax.scatter(group["petal_length"], group["petal_width"], label=species, s=36)
wrong = df[df["prediction"] != df["species"]]
ax.scatter(wrong["petal_length"], wrong["petal_width"], s=160, facecolors="none",
           edgecolors="black", linewidths=1.5, label="misclassified")
ax.set_xlabel("petal length (cm)"); ax.set_ylabel("petal width (cm)")
ax.legend(frameon=False)
```

![The finished flow: the form-driven model on top, the coded model with its confusion matrix and chart below](/img/sklearn-iris-flow.webp)

![Test flowers by petal length and width, coloured by species, with the five misclassified flowers circled](/img/sklearn-iris-chart.webp)

## What the two results say

This split scores 40 out of 45, or 89 %, against the form's 100 %. Neither model is wrong; the difference is which 45 flowers ended up in the test set. With a test set this small, one or two awkward flowers move the score by several points. The chart shows where those flowers are: setosa sits apart, while versicolor and virginica overlap in petal size, and every mistake falls in that overlap.

That's the case for keeping each step as its own node. The split, the model, the confusion matrix and the chart can each be opened and checked on their own, and changing `random_state` or the model and re-running from that node shows how stable the result really is.

## Where to go next

- Swap `RandomForestClassifier` for `LogisticRegression` or `GradientBoostingClassifier` and compare the confusion matrices.
- Replace the iris node with your own table, from a CSV or any database connection, and keep the rest of the flow.
- For libraries with strict version pins, the plugin also ships **scikit-learn (isolated)**, which runs your code in its own virtual environment and exchanges data as Arrow files.
- Writing your own engine? The plugin is a working template for the [plugin contract](https://github.com/sidewinder-labs/sidewinder-flow-studio/blob/main/docs/PLUGINS.md).

→ [Flow Studio on GitHub](https://github.com/sidewinder-labs/sidewinder-flow-studio)
