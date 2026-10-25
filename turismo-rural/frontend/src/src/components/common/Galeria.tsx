import { Imagen } from '../../types';

export default function Galeria({ imagenes, alt }: { imagenes?: Imagen[]; alt: string }) {
  if (!imagenes?.length) return null;
  return (
    <div className="galeria">
      {imagenes.map((i) => <img key={i.id} src={i.url} alt={i.descripcion || alt} loading="lazy" decoding="async" />)}
    </div>
  );
}
