import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import BootstrapTable from 'react-bootstrap-table-next';
import cellEditFactory, { Type } from 'react-bootstrap-table2-editor';

import * as api from '../services/dashboard';

const TableParameters = () => {
  let { experiment, error } = useSelector((state) => state.expt);
  let { parameters } = experiment;

  const [loading, setLoading] = useState(true);
  const [columns, setColumns] = useState([null]);
  const [rows, setRows] = useState(null);

  // Prepare rows and columns of table
  useEffect(() => {
    setRows([
      {
        numShared: parameters.numShared,
        // orderFlag: para.orderFlag
      },
    ]);

    setColumns([
      {
        dataField: 'numShared',
        text: 'Users per task',
        validator: (newValue, row, column) => {
          if (!isNaN(newValue)) {
            if (newValue < 1)
              return {
                valid: false,
                message: 'Number of shared users have to greater than 0',
              };
            else return true;
          } else
            return { valid: false, message: 'Pleases enter a valid number' };
        },
      },
      {
        dataField: 'orderFlag',
        text: 'Order Flag',
        editor: {
          type: Type.SELECT,
          options: [
            {
              value: 'default',
              label: 'default',
            },
            {
              value: 'increasing',
              label: 'increasing',
            },
            {
              value: 'decreasing',
              label: 'decreasing',
            },
          ],
        },
      },
    ]);

    setLoading(false);
  }, [parameters]);

  // If cell edit is updated successfully, redirect to dashboard loading page to refresh resources.
  const cellEdit = cellEditFactory({
    mode: 'dbclick',
    blurToSave: true,
    beforeSaveCell: (oldValue, newValue, row, column, done) => {
      if (newValue === oldValue) done(false);
      else {
        console.log('Save new parameters handle');
        // api.updateParameter({oldValue, newValue, field: column.dataField})
        // .then(res => {
        //
        //   done()
        // })
        // .catch(err => {
        //   if (window.alert(err.message)) done(false)
        // })
      }
      return { async: true };
    },
    afterSaveCell: (oldValue, newValue, row, column) => {
      // console.log("edited")
    },
  });

  if (loading) return <></>;

  return (
    <BootstrapTable
      keyField='id'
      cellEdit={cellEdit}
      data={rows}
      columns={columns}
    />
  );
};

export default TableParameters;
