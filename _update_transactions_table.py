from pathlib import Path

path = Path("c:/Users/s.suresh.FPG/OneDrive - Future Pipe Industries Group LTD/Desktop/LIBRARY/Personal/Project/attachments/index.html")
text = path.read_text(encoding="utf-8")

start = text.index("function Transactions({")
end = text.index("\n\nfunction Notifications({")

replacement = '''function Transactions({
  transactions,
  onDelete
}) {
  const [filter, setFilter] = useState("All");
  const filtered = filter === "All" ? transactions : transactions.filter(t => t.type === filter);
  const sorted = [...filtered].sort((a, b) => b.date.localeCompare(a.date));

  const typeColor = {
    Income: COLOR.banyan,
    Expense: COLOR.brick,
    Investment: COLOR.marigold,
    Transfer: COLOR.inkSoft
  };

  return /*#__PURE__*/React.createElement(Screen, {
    title: "Transactions",
    subtitle: `${transactions.length} entries logged`
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex gap-2",
    style: {
      marginBottom: 14,
      overflowX: "auto",
      paddingBottom: 2
    }
  }, ["All", "Income", "Expense", "Investment", "Transfer"].map(f => /*#__PURE__*/React.createElement("button", {
    key: f,
    onClick: () => setFilter(f),
    style: {
      fontFamily: FONT_BODY,
      fontSize: 12,
      fontWeight: 600,
      padding: "6px 12px",
      borderRadius: 999,
      border: `1.5px solid ${filter === f ? COLOR.ink : COLOR.rule}`,
      background: filter === f ? COLOR.ink : "transparent",
      color: filter === f ? COLOR.white : COLOR.inkSoft,
      whiteSpace: "nowrap"
    }
  }, f))), sorted.length === 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "center",
      padding: "40px 0",
      color: COLOR.mutedInk,
      fontFamily: FONT_BODY
    }
  }, "Nothing here yet. Add your first entry from the + tab."), sorted.length > 0 && /*#__PURE__*/React.createElement(Card, {
    style: {
      padding: 0,
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      overflowX: "auto"
    }
  }, /*#__PURE__*/React.createElement("table", {
    style: {
      width: "100%",
      borderCollapse: "collapse",
      fontFamily: FONT_BODY,
      minWidth: 900,
      fontSize: 12
    }
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", {
    style: {
      background: "#F4F4F6"
    }
  }, ["Date", "Type", "Category", "Product", "Batch", "Animal ID", "Payment", "Amount", "Notes", "Action"].map((header, index) => /*#__PURE__*/React.createElement("th", {
    key: header,
    style: {
      textAlign: index === 7 ? "right" : "left",
      padding: "10px 8px",
      borderBottom: `1px solid ${COLOR.rule}`,
      color: COLOR.inkSoft,
      fontWeight: 700,
      fontSize: 11,
      textTransform: "uppercase",
      letterSpacing: "0.04em"
    }
  }, header))), /*#__PURE__*/React.createElement("tbody", null, sorted.map((t, i) => {
    const meta = parseFarmMeta(t);
    const noteText = (t.notes || "").replace(/^\[Farm Entry:.*?\]\s*/, "").trim();
    return /*#__PURE__*/React.createElement("tr", {
      key: t.id,
      style: {
        borderTop: i === 0 ? "none" : `1px solid ${COLOR.rule}`,
        background: i % 2 === 0 ? "#FFFFFF" : "#FAFAFB"
      }
    }, /*#__PURE__*/React.createElement("td", {
      style: {
        padding: "10px 8px",
        verticalAlign: "top",
        fontWeight: 600,
        color: COLOR.ink
      }
    }, fmtDateHuman(t.date)), /*#__PURE__*/React.createElement("td", {
      style: {
        padding: "10px 8px",
        verticalAlign: "top"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        background: `${typeColor[t.type] || COLOR.mutedInk}22`,
        color: typeColor[t.type] || COLOR.ink,
        borderRadius: 999,
        padding: "4px 8px",
        fontWeight: 700
      }
    }, t.type)), /*#__PURE__*/React.createElement("td", {
      style: {
        padding: "10px 8px",
        verticalAlign: "top",
        fontWeight: 600,
        color: COLOR.ink
      }
    }, t.category || "-"), /*#__PURE__*/React.createElement("td", {
      style: {
        padding: "10px 8px",
        verticalAlign: "top",
        color: COLOR.inkSoft
      }
    }, t.subcategory || "-"), /*#__PURE__*/React.createElement("td", {
      style: {
        padding: "10px 8px",
        verticalAlign: "top",
        color: COLOR.inkSoft
      }
    }, meta.batchName || "-"), /*#__PURE__*/React.createElement("td", {
      style: {
        padding: "10px 8px",
        verticalAlign: "top",
        color: COLOR.inkSoft
      }
    }, meta.animalId || "-"), /*#__PURE__*/React.createElement("td", {
      style: {
        padding: "10px 8px",
        verticalAlign: "top",
        color: COLOR.inkSoft
      }
    }, t.paymentMethod || "-"), /*#__PURE__*/React.createElement("td", {
      style: {
        padding: "10px 8px",
        verticalAlign: "top",
        textAlign: "right",
        fontWeight: 700,
        fontVariantNumeric: "tabular-nums",
        color: t.type === "Income" ? COLOR.banyan : t.type === "Expense" ? COLOR.brick : COLOR.ink
      }
    }, t.type === "Income" ? "+" : t.type === "Expense" ? "-" : "", formatINRShort(t.amount)), /*#__PURE__*/React.createElement("td", {
      style: {
        padding: "10px 8px",
        verticalAlign: "top",
        color: COLOR.inkSoft,
        maxWidth: 180,
        wordBreak: "break-word"
      }
    }, noteText || "-"), /*#__PURE__*/React.createElement("td", {
      style: {
        padding: "10px 8px",
        verticalAlign: "top",
        textAlign: "center"
      }
    }, /*#__PURE__*/React.createElement("button", {
      onClick: () => onDelete(t.id),
      style: {
        color: COLOR.mutedInk,
        opacity: 0.6,
        background: "transparent",
        border: "none",
        cursor: "pointer"
      }
    }, /*#__PURE__*/React.createElement(Trash2, {
      size: 15
    }))));
  }))))));
}
'''

new_text = text[:start] + replacement + text[end:]
path.write_text(new_text, encoding="utf-8")
print("Updated transactions block")
