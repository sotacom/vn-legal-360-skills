#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Vietnamese Administrative Document (.docx) Drafter Engine
Compliant with Decree No. 30/2020/ND-CP on archival and administrative work:
- Page Size: A4 (210mm x 297mm -> 11906 x 16838 twips)
- Margins: Top 20mm (1134), Bottom 20mm (1134), Left 30mm (1701), Right 15mm (850)
- Font: Times New Roman, 13pt (26 half-points)
- Zero external dependencies (uses Python standard library zipfile + xml.sax.saxutils)

Usage:
  python3 scripts/docx-drafter.py --spec <path-to-dossier-spec.json> [--out-dir <output-folder>]
"""

import argparse
import json
import os
import zipfile
from xml.sax.saxutils import escape


def build_docx(filepath, elements):
    content_types_xml = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
</Types>"""

    rels_xml = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>"""

    word_rels_xml = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>"""

    styles_xml = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:docDefaults>
    <w:rPrDefault>
      <w:rPr>
        <w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/>
        <w:sz w:val="26"/>
        <w:szCs w:val="26"/>
        <w:lang w:val="vi-VN"/>
      </w:rPr>
    </w:rPrDefault>
    <w:pPrDefault>
      <w:pPr>
        <w:spacing w:before="80" w:after="80" w:line="276" w:lineRule="auto"/>
        <w:jc w:val="both"/>
      </w:pPr>
    </w:pPrDefault>
  </w:docDefaults>
</w:styles>"""

    body_parts = []

    def make_run(text, bold=False, italic=False, underline=False, sz=26):
        rpr = ['<w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/>']
        if bold:
            rpr.append("<w:b/><w:bCs/>")
        if italic:
            rpr.append("<w:i/><w:iCs/>")
        if underline:
            rpr.append('<w:u w:val="single"/>')
        rpr.append(f'<w:sz w:val="{sz}"/><w:szCs w:val="{sz}"/>')
        return f'<w:r><w:rPr>{"".join(rpr)}</w:rPr><w:t xml:space="preserve">{escape(str(text))}</w:t></w:r>'

    def make_p(runs_xml, align="both", before=80, after=80, line=276, first_line=0):
        ind = f'<w:ind w:firstLine="{first_line}"/>' if first_line else ""
        return (
            f"<w:p><w:pPr>"
            f'<w:spacing w:before="{before}" w:after="{after}" w:line="{line}" w:lineRule="auto"/>'
            f"{ind}"
            f'<w:jc w:val="{align}"/>'
            f"</w:pPr>{runs_xml}</w:p>"
        )

    for el in elements:
        etype = el.get("type", "p")
        if etype == "header_quoc_hieu":
            left_top = el.get("left_top", "")
            left_sub = el.get("left_sub", "")
            date_line = el.get("date_line", "..., ngày ... tháng ... năm 20...")
            if left_top:
                body_parts.append(f"""
                <w:tbl>
                  <w:tblPr>
                    <w:tblW w:w="5000" w:type="pct"/>
                    <w:tblBorders>
                      <w:top w:val="none"/><w:left w:val="none"/><w:bottom w:val="none"/><w:right w:val="none"/>
                      <w:insideH w:val="none"/><w:insideV w:val="none"/>
                    </w:tblBorders>
                  </w:tblPr>
                  <w:tr>
                    <w:tc>
                      <w:tcPr><w:tcW w:w="2100" w:type="pct"/></w:tcPr>
                      {make_p(make_run(left_top, bold=True, sz=24), align="center", before=0, after=20)}
                      {make_p(make_run(left_sub, bold=False, sz=24), align="center", before=0, after=20)}
                      {make_p(make_run("---------------", bold=True, sz=24), align="center", before=0, after=40)}
                    </w:tc>
                    <w:tc>
                      <w:tcPr><w:tcW w:w="2900" w:type="pct"/></w:tcPr>
                      {make_p(make_run("CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM", bold=True, sz=25), align="center", before=0, after=20)}
                      {make_p(make_run("Độc lập - Tự do - Hạnh phúc", bold=True, sz=26), align="center", before=0, after=20)}
                      {make_p(make_run("---------------", bold=True, sz=24), align="center", before=0, after=40)}
                      {make_p(make_run(date_line, italic=True, sz=26), align="center", before=40, after=60)}
                    </w:tc>
                  </w:tr>
                </w:tbl>
                """)
            else:
                body_parts.append(make_p(make_run("CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM", bold=True, sz=26), align="center", before=0, after=20))
                body_parts.append(make_p(make_run("Độc lập - Tự do - Hạnh phúc", bold=True, sz=28), align="center", before=0, after=20))
                body_parts.append(make_p(make_run("---------------", bold=True, sz=26), align="center", before=0, after=60))
                body_parts.append(make_p(make_run(date_line, italic=True, sz=26), align="right", before=40, after=120))

        elif etype == "title":
            body_parts.append(make_p(make_run(el.get("text", ""), bold=True, sz=28), align="center", before=120, after=60))
            if el.get("subtitle"):
                body_parts.append(make_p(make_run(el["subtitle"], bold=True, italic=True, sz=26), align="center", before=0, after=140))

        elif etype == "kinh_gui":
            body_parts.append(
                make_p(
                    make_run(el.get("text", ""), bold=True, sz=el.get("sz", 26)),
                    align=el.get("align", "center"),
                    before=el.get("before", 100),
                    after=el.get("after", 120),
                )
            )

        elif etype == "heading":
            body_parts.append(
                make_p(
                    make_run(el.get("text", ""), bold=True, underline=el.get("underline", False), sz=el.get("sz", 26)),
                    align=el.get("align", "left"),
                    before=el.get("before", 140),
                    after=el.get("after", 80),
                )
            )

        elif etype in ("p", "runs_p"):
            first_line = el.get("first_line", 420 if el.get("indent", False) else 0)
            if "runs" in el and isinstance(el["runs"], list):
                r_xml = "".join(
                    make_run(
                        r.get("text", ""),
                        bold=r.get("bold", el.get("bold", False)),
                        italic=r.get("italic", el.get("italic", False)),
                        underline=r.get("underline", el.get("underline", False)),
                        sz=r.get("sz", el.get("sz", 26)),
                    )
                    for r in el["runs"]
                )
            else:
                r_xml = make_run(
                    el.get("text", ""),
                    bold=el.get("bold", False),
                    italic=el.get("italic", False),
                    underline=el.get("underline", False),
                    sz=el.get("sz", 26),
                )
            body_parts.append(
                make_p(
                    r_xml,
                    align=el.get("align", "both"),
                    before=el.get("before", 70),
                    after=el.get("after", 70),
                    first_line=first_line,
                )
            )

        elif etype == "table":
            headers = el.get("headers", [])
            rows = el.get("rows", [])
            col_pcts = el.get("col_pcts") or el.get("col_widths") or [int(5000 / max(1, len(headers)))] * len(headers)
            tr_list = []
            th_cells = []
            for idx, h in enumerate(headers):
                th_cells.append(f"""
                <w:tc>
                  <w:tcPr>
                    <w:tcW w:w="{col_pcts[idx]}" w:type="pct"/>
                    <w:shd w:val="clear" w:color="auto" w:fill="E8EEF5"/>
                  </w:tcPr>
                  {make_p(make_run(h, bold=True, sz=24), align="center", before=60, after=60)}
                </w:tc>""")
            tr_list.append(f"<w:tr>{''.join(th_cells)}</w:tr>")
            for row in rows:
                td_cells = []
                for idx, cell_text in enumerate(row):
                    align = "center" if idx == 0 else "both"
                    td_cells.append(f"""
                    <w:tc>
                      <w:tcPr><w:tcW w:w="{col_pcts[idx]}" w:type="pct"/></w:tcPr>
                      {make_p(make_run(cell_text, bold=(idx == 1), sz=24), align=align, before=50, after=50)}
                    </w:tc>""")
                tr_list.append(f"<w:tr>{''.join(td_cells)}</w:tr>")

            body_parts.append(f"""
            <w:tbl>
              <w:tblPr>
                <w:tblW w:w="5000" w:type="pct"/>
                <w:tblBorders>
                  <w:top w:val="single" w:sz="6" w:space="0" w:color="333333"/>
                  <w:left w:val="single" w:sz="6" w:space="0" w:color="333333"/>
                  <w:bottom w:val="single" w:sz="6" w:space="0" w:color="333333"/>
                  <w:right w:val="single" w:sz="6" w:space="0" w:color="333333"/>
                  <w:insideH w:val="single" w:sz="4" w:space="0" w:color="666666"/>
                  <w:insideV w:val="single" w:sz="4" w:space="0" w:color="666666"/>
                </w:tblBorders>
              </w:tblPr>
              {''.join(tr_list)}
            </w:tbl>
            """)

        elif etype in ("signature", "signature_single"):
            left_lines = el.get("left_lines", [])
            right_title = el.get("right_title") or el.get("title") or "NGƯỜI LÀM ĐƠN"
            right_sub = el.get("right_sub") or el.get("subtitle") or "(Ký, ghi rõ họ tên và đóng dấu nếu có)"
            left_xml = ""
            if left_lines:
                left_xml += make_p(make_run("Nơi nhận / Ghi chú:", bold=True, italic=True, sz=24), align="left", before=40, after=20)
                for ln in left_lines:
                    left_xml += make_p(make_run(ln, sz=22), align="left", before=10, after=10)
            else:
                left_xml = make_p(make_run("", sz=24), align="left")

            body_parts.append(f"""
            <w:tbl>
              <w:tblPr>
                <w:tblW w:w="5000" w:type="pct"/>
                <w:tblBorders>
                  <w:top w:val="none"/><w:left w:val="none"/><w:bottom w:val="none"/><w:right w:val="none"/>
                  <w:insideH w:val="none"/><w:insideV w:val="none"/>
                </w:tblBorders>
              </w:tblPr>
              <w:tr>
                <w:tc>
                  <w:tcPr><w:tcW w:w="2200" w:type="pct"/></w:tcPr>
                  {left_xml}
                </w:tc>
                <w:tc>
                  <w:tcPr><w:tcW w:w="2800" w:type="pct"/></w:tcPr>
                  {make_p(make_run(right_title, bold=True, sz=26), align="center", before=40, after=20)}
                  {make_p(make_run(right_sub, italic=True, sz=24), align="center", before=0, after=900)}
                  {make_p(make_run("...........................................................", bold=True, sz=26), align="center", before=200, after=40)}
                </w:tc>
              </w:tr>
            </w:tbl>
            """)

    sect_pr = """
    <w:sectPr>
      <w:pgSz w:w="11906" w:h="16838"/>
      <w:pgMar w:top="1134" w:right="850" w:bottom="1134" w:left="1701" w:header="708" w:footer="708" w:gutter="0"/>
    </w:sectPr>"""

    document_xml = f"""<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    {''.join(body_parts)}
    {sect_pr}
  </w:body>
</w:document>"""

    os.makedirs(os.path.dirname(os.path.abspath(filepath)), exist_ok=True)
    with zipfile.ZipFile(filepath, "w", zipfile.ZIP_DEFLATED) as zf:
        zf.writestr("[Content_Types].xml", content_types_xml)
        zf.writestr("_rels/.rels", rels_xml)
        zf.writestr("word/_rels/document.xml.rels", word_rels_xml)
        zf.writestr("word/styles.xml", styles_xml)
        zf.writestr("word/document.xml", document_xml)


def main():
    parser = argparse.ArgumentParser(description="Generate Decree 30/2020/ND-CP compliant .docx files from JSON spec")
    parser.add_argument("--spec", required=True, help="Path to JSON specification file")
    parser.add_argument("--out-dir", default=".", help="Output directory for generated .docx files")
    args = parser.parse_args()

    with open(args.spec, "r", encoding="utf-8") as f:
        spec = json.load(f)

    documents = spec.get("documents", [spec] if "filename" in spec else [])
    generated = []
    for doc in documents:
        fname = doc["filename"]
        if not fname.endswith(".docx"):
            fname += ".docx"
        out_path = os.path.join(args.out_dir, fname)
        build_docx(out_path, doc.get("elements", []))
        generated.append(os.path.abspath(out_path))

    print(json.dumps({"ok": True, "generatedCount": len(generated), "files": generated}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
