import GenericCrudPage from '../../components/GenericCrudPage';

export default function Units() {
  return (
    <GenericCrudPage
      title="Satuan (UOM)"
      endpoint="/units"
      fields={[
        { name: 'code', label: 'Kode', required: true },
        { name: 'name', label: 'Nama Satuan', required: true },
      ]}
    />
  );
}
