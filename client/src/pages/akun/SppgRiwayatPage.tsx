// import React from 'react';

// export default function SppgRiwayatPage({ recentReports }) {
//   return (
//     <div className="role-panel-table">
//       <table>
//         <thead>
//           <tr>
//             <th>Tanggal</th>
//             <th>Sekolah</th>
//             <th>Porsi</th>
//             <th>Status</th>
//             <th>Menu</th>
//           </tr>
//         </thead>
//         <tbody>
//           {recentReports.map((item) => (
//             <tr key={String(item.id)}>
//               <td>{String(item.tanggal ?? '-')}</td>
//               <td>{String(item.sekolah_nama ?? '-')}</td>
//               <td>{String(item.porsi_distribusi ?? '-')}</td>
//               <td>{String(item.status_delivery ?? '-')}</td>
//               <td>{String(item.menu_deskripsi ?? '-')}</td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// }
