import React from 'react';
import * as PropTypes from "prop-types";

function Table({ columns, data, actions, expandable, onRowClick }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white shadow-md rounded-lg">
        <thead className="bg-brand-secondary text-white">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className="px-6 py-3 text-left text-sm font-medium uppercase tracking-wider"
              >
                {column.label}
              </th>
            ))}
            {actions && (
              <th className="px-6 py-3 text-left text-sm font-medium uppercase tracking-wider">
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length + (actions ? 1 : 0)}
                className="px-6 py-4 text-center text-gray-500"
              >
                No data available
              </td>
            </tr>
          ) : (
            data.map((row, index) => (
              <React.Fragment key={index}>
                <tr
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => onRowClick && onRowClick(row)}
                >
                  {columns.map((column) => (
                    <td key={column.key} className="px-6 py-4 text-sm text-gray-900">
                      {column.format ? column.format(row[column.key]) : (row[column.key] || '-')}
                    </td>
                  ))}
                  {actions && (
                    <td className="px-6 py-4 text-sm">
                      <div className="flex space-x-2">
                        {actions.map((action) => (
                          action.render ? (
                            <div key={action.label}>{action.render(row)}</div>
                          ) : (
                            <button
                              key={action.label}
                              onClick={(e) => {
                                e.stopPropagation(); // Prevent row click when clicking buttons
                                action.onClick(row);
                              }}
                              className={`px-3 py-1 rounded-md text-white ${action.className}`}
                            >
                              {action.label}
                            </button>
                          )
                        ))}
                      </div>
                    </td>
                  )}
                </tr>
                {expandable && expandable.rowExpandable(row) && expandable.expandedRowKeys.includes(row.poId) && (
                  <tr>
                    <td colSpan={columns.length + (actions ? 1 : 0)}>
                      {expandable.expandedRowRender(row)}
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

Table.propTypes = {
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      format: PropTypes.func,
    })
  ).isRequired,
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
  actions: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      onClick: PropTypes.func.isRequired,
      className: PropTypes.string,
      render: PropTypes.func,
    })
  ),
  expandable: PropTypes.shape({
    expandedRowRender: PropTypes.func,
    rowExpandable: PropTypes.func,
    expandedRowKeys: PropTypes.arrayOf(PropTypes.number),
  }),
  onRowClick: PropTypes.func,
};

Table.defaultProps = {
  actions: null,
  expandable: null,
  onRowClick: null,
};

export default Table;