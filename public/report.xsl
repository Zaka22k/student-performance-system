<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="html" encoding="UTF-8" indent="yes"/>

  <xsl:template match="/report">
    <html lang="ru">
      <head>
        <meta charset="UTF-8"/>
        <title><xsl:value-of select="title"/></title>
        <style>
          body { font-family: "Times New Roman", serif; margin: 24px; color: #000; }
          h1 { font-size: 20px; text-align: center; margin: 0 0 12px; }
          dl { margin: 0 0 12px; }
          dl div { display: flex; gap: 8px; }
          dt { font-weight: bold; }
          dd { margin: 0; }
          table { border-collapse: collapse; width: 100%; font-size: 13px; }
          th, td { border: 1px solid #000; padding: 4px 6px; }
          th { background: #eee; }
          .left { text-align: left; } .center { text-align: center; } .right { text-align: right; }
          .totals { margin-top: 12px; font-size: 13px; }
          .sign { margin-top: 32px; font-size: 13px; }
          .meta { margin-top: 24px; font-size: 11px; color: #555; }
        </style>
      </head>
      <body>
        <h1><xsl:value-of select="title"/></h1>
        <dl>
          <xsl:for-each select="parameters/parameter">
            <div><dt><xsl:value-of select="@name"/>:</dt><dd><xsl:value-of select="."/></dd></div>
          </xsl:for-each>
        </dl>
        <table>
          <thead>
            <tr>
              <xsl:for-each select="columns/column">
                <th class="{@align}"><xsl:value-of select="."/></th>
              </xsl:for-each>
            </tr>
          </thead>
          <tbody>
            <xsl:for-each select="rows/row">
              <tr>
                <xsl:for-each select="cell">
                  <xsl:variable name="key" select="@key"/>
                  <td class="{/report/columns/column[@key = $key]/@align}"><xsl:value-of select="."/></td>
                </xsl:for-each>
              </tr>
            </xsl:for-each>
          </tbody>
        </table>
        <div class="totals">
          <xsl:for-each select="totals/total">
            <div><b><xsl:value-of select="@label"/>:</b><xsl:text> </xsl:text><xsl:value-of select="."/></div>
          </xsl:for-each>
        </div>
        <div class="sign">
          <xsl:for-each select="signatures/signature">
            <div>
              <xsl:value-of select="@label"/>: ______________________
              <xsl:if test="string(.) != ''"> / <xsl:value-of select="."/> /</xsl:if>
            </div>
          </xsl:for-each>
        </div>
        <div class="meta">Сформировано: <xsl:value-of select="@generated"/></div>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
