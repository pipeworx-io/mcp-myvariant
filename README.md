# mcp-myvariant

MyVariant.info MCP.

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 1394+ live data sources.

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

Or connect to the full Pipeworx gateway for access to all 1394+ data sources:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English:

```
ask_pipeworx({ question: "your question about Myvariant data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [Docs and guides](https://pipeworx.io/docs)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
