# sidewinderlabs

Source for [sidewinderlabs.dev](https://sidewinderlabs.dev), the Sidewinder Labs website. Product code and documentation live in [sidewinder-flow-studio](https://github.com/sidewinder-labs/sidewinder-flow-studio).

## Open-source data tools, built in public

**[Sidewinder Flow Studio](https://github.com/sidewinder-labs/sidewinder-flow-studio)** is a visual ETL tool where every node is a Python or SQL cell. Data moves between nodes as Apache Arrow, so you can inspect any step, re-run from any point, and mix pandas, Polars and DuckDB in the same flow — or push the work down into your warehouse.

- Load, transform and bulk-load data across PostgreSQL, ClickHouse, Snowflake, Trino and a dozen more
- Explore any node output or table with drag-and-drop charts, compiled to SQL and run where the data lives
- Extend it with plugins, from scikit-learn models to engines of your own

Self-hosted and AGPL-3.0 licensed. Built and maintained by one person; issues and ideas are welcome.

- [Website](https://sidewinderlabs.dev)
- [Documentation](https://docs.sidewinderlabs.dev)
- [Latest release](https://github.com/sidewinder-labs/sidewinder-flow-studio/releases/latest)

## Working on the site

Astro, deployed to Cloudflare Workers.

```bash
npm install
npm run dev       # local dev server at http://localhost:4321
npm run check     # build, typecheck and a dry-run deploy
npm run deploy    # publish to Cloudflare
```
