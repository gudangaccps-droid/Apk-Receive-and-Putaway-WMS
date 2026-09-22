import GenericCrudPage from '../../components/GenericCrudPage';

export default function Suppliers() {
  return (
    <GenericCrudPage
      title="Supplier"
      endpoint="/suppliers"
      fields={[
        { name: 'code', label: 'Kode' },
        { name: 'name', label: 'Nama Supplier', required: true },
        { name: 'contact_person', label: 'Kontak' },
        { name: 'phone', label: 'Telepon' },
        { name: 'address', label: 'Alamat' },
      ]}
    />
  );
}
