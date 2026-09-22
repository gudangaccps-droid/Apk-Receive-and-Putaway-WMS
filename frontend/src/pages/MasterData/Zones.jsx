import GenericCrudPage from '../../components/GenericCrudPage';

export default function Zones() {
  return (
    <GenericCrudPage
      title="Zona Gudang"
      endpoint="/zones"
      fields={[
        { name: 'code', label: 'Kode', required: true },
        { name: 'name', label: 'Nama Zona', required: true },
        { name: 'description', label: 'Deskripsi' },
      ]}
    />
  );
}
