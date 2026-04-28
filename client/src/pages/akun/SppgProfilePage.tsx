// import React from 'react';

// export default function SppgProfilePage({ profileForm, setProfileForm, savingProfile, handleProfileSubmit, panel }) {
//   return (
//     <form className="role-panel-form" onSubmit={handleProfileSubmit}>
//       {/* ...input fields sama seperti sebelumnya... */}
//       <label>
//         Nama Pengelola
//         <input value={profileForm.nama_pengelola ?? ''} onChange={(event) => setProfileForm((prev) => ({ ...prev, nama_pengelola: event.target.value }))} />
//       </label>
//       {/* ...input lain sesuai panel.options... */}
//       <button type="submit" className="role-panel-button" disabled={savingProfile}>
//         {savingProfile ? 'Menyimpan...' : 'Simpan Profil'}
//       </button>
//     </form>
//   );
// }
