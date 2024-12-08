import React from "react";

export default function ErrorTable({ errors, toLine, toTab, current }) {
  console.log(errors);
  return (
    <table style={{ width: "100%", borderCollapse: "collapse" }}>
      <thead>
        <tr>
          <th style={{ textAlign: "left", padding: "10px", borderBottom: "1px solid #ccc" }}>
            Mensaje de Error
          </th>
          <th style={{ textAlign: "center", padding: "10px", borderBottom: "1px solid #ccc" }}>
            Línea
          </th>
          <th style={{ textAlign: "center", padding: "10px", borderBottom: "1px solid #ccc" }}>
            Detalle
          </th>
          <th style={{ textAlign: "center", padding: "10px", borderBottom: "1px solid #ccc" }}>
            Pestaña
          </th>
        </tr>
      </thead>
      <tbody>
        {errors.map((error, index) => (
          <React.Fragment key={index}>
            <tr>
              <td style={{ padding: "10px", verticalAlign: "top" }}>
                <pre id="error-msg" style={{ margin: 0, fontSize: "14px", lineHeight: "1.2em" }}>
                  {error.error.message}
                </pre>
              </td>
              <td style={{ textAlign: "center", padding: "10px", verticalAlign: "top" }}>
                {error.error.line+1}
              </td>
              <td style={{ textAlign: "center", padding: "10px", verticalAlign: "top" }}>
                <button onClick={() => toLine(error.error.line)} style={{ cursor: "pointer" }} disabled={current !== error.error.tab_index}>
                  Ir a línea
                </button>
              </td>
              <td style={{ textAlign: "center", padding: "10px", verticalAlign: "top" }}>
                <button onClick={() => toTab(error.error.tab_index)} style={{ cursor: "pointer" }}>
                  Ir a {error.error.tab}
                </button>
              </td>
            </tr>
          </React.Fragment>
        ))}
      </tbody>
    </table>
  );
}
