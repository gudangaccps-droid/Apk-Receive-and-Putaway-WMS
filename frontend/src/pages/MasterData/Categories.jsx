import GenericCrudPage from '../../components/GenericCrudPage';

export default function Categories() {
  return (
    <GenericCrudPage
      title="Kategori Barang"
      endpoint="/categories"
      fields={[
        { name: 'name', label: 'Nama Kategori', required: true },
        { name: 'description', label: 'Deskripsi' },
      ]}
    />
  );
}
