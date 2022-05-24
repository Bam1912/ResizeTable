import './App.css';
import { useLayoutEffect } from 'react';
import ResizeTable from './Functions/ResizeTable'

function App() {
  
  useLayoutEffect( () => {
    // console.log('runResize')
    const a = new ResizeTable('testtab')
},[]);

  return (
    <div className="App">
    <table id='testtab'>
              <thead>
                <tr><th className='col_1'>Col1</th>
                    <th className='col_2'>Col2</th>
                    <th className='col_3'>Col3</th>
                    <th className='col_4'>Col4</th></tr>
              </thead>
              <tbody>
                <tr><td className='col_1'>data1</td>
                    <td className='col_2'>data2</td>
                    <td className='col_3'>data3</td>
                    <td className='col_4'>data4</td></tr>
                <tr><td className='col_1'>data12</td>
                    <td className='col_2'>data22</td>
                    <td className='col_3'>data32</td>
                    <td className='col_4'>data42</td></tr>
              </tbody>
            </table>
    </div>
  );
}

export default App;
