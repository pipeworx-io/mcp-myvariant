# mcp-myvariant

MyVariant.info MCP.

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 1476+ live data sources.

## Tools

| Tool | Description |
|------|-------------|
| `query` | Search aggregated human genetic-variant annotations on MyVariant.info. Accepts an rsID ("rs58991260"), an HGVS id ("chr1:g.218631822G>A"), or a fielded query ("dbnsfp.genename:CDK2", "clinvar.rcv.clinical_significance:pathogenic"). Each hit merges dbSNP, ClinVar clinical significance, CADD/dbNSFP deleteriousness scores, and gnomAD population allele frequencies. Returns { total, hits }; hit._id is usually the HGVS id you can pass to the variant tool. |
| `variant` | Get the full merged annotation for a single human genetic variant by its HGVS id (e.g. "chr7:g.140453136A>T"). Returns annotations aggregated from dbSNP, ClinVar (pathogenicity / clinical significance), CADD and dbNSFP (deleteriousness/conservation scores), and gnomAD (population allele frequencies). Use to look up a known variant and read its pathogenicity and population frequency. |
| `metadata` | Returns MyVariant.info build metadata: total indexed variant count, available annotation sources (dbSNP, ClinVar, CADD, dbNSFP, gnomAD), and their current release/build versions. |

## Quick Start

Add to your MCP client (Claude Desktop, Cursor, Windsurf, etc.):

```json
{
  "mcpServers": {
    "myvariant": {
      "url": "https://gateway.pipeworx.io/myvariant/mcp"
    }
  }
}
```

### What this endpoint actually serves

`tools/list` at `https://gateway.pipeworx.io/myvariant/mcp` returns the tools in the table
above **plus the shared Pipeworx meta-tools** — `ask_pipeworx`,
`discover_tools`, `search_within`, `remember`/`recall` and the rest of the
gateway-wide set. So the tool count you see is larger than this table: a
single-pack endpoint currently lists roughly 30 shared tools alongside the
pack's own. The connection's `initialize` response states its exact scope, and
is the authoritative answer for a given day.

This is deliberate, not multiplexing by accident. The meta-tools are what let a
scoped connection answer a question this pack does not cover — via
`ask_pipeworx`, which routes across the whole catalog — without you adding a
second MCP server. There is currently no way to mount a pack endpoint without
them; if the extra schemas cost you more context than the routing is worth,
connect to the full gateway once rather than to several pack endpoints.

Or connect to the full Pipeworx gateway to get every pack's tools listed
directly, instead of just this one's:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

Both URLs reach the same gateway and the same 1476+ data sources. The
only difference is which pack's tools are listed **directly**; `ask_pipeworx`
reaches all of them from either one.

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English —
this works on the pack endpoint above as well as on the full gateway:

```
ask_pipeworx({ question: "your question about Myvariant data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [Docs and guides](https://pipeworx.io/docs)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
