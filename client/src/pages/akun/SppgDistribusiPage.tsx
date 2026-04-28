import React from 'react';

export default function SppgDistribusiPage({ reportForm, setReportForm, savingReport, handleReportSubmit, distribusiPhoto, setDistribusiPhoto, panel }) {
  return (
    <form className="role-panel-form" onSubmit={handleReportSubmit}>
      {/* ...input fields sama seperti sebelumnya... */}
      <label>
        Tanggal
        <input type="date" value={reportForm.tanggal ?? ''} onChange={(event) => setReportForm((prev) => ({ ...prev, tanggal: event.target.value }))} />
      </label>
      {/* ...input lain sesuai panel.options... */}
      <label>
        Foto Menu (JPG/PNG)
        <input
          type="file"
          accept="image/png,image/jpeg"
          required
          onChange={(event) => {
            const file = event.target.files?.[0] ?? null;
            setDistribusiPhoto({ menu: file });
          }}
        />
        {distribusiPhoto.menu && <span>File: {distribusiPhoto.menu.name}</span>}
      </label>
      <button type="submit" className="role-panel-button" disabled={savingReport}>
        {savingReport ? 'Menyimpan...' : 'Simpan Distribusi'}
      </button>
    </form>
  );
}
