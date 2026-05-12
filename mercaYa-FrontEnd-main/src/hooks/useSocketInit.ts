import { useEffect } from "react";
import { useVentasStore }    from "../store/ventasStore";
import { useInventarioStore } from "../store/inventarioStore";
import { useDespachoStore }   from "../store/despachoStore";

// Llama este hook UNA sola vez en AppLayout
// Inicializa todos los listeners de Socket.io y los limpia al desmontar
export function useSocketInit() {
  const initVentas     = useVentasStore((s) => s.initSocket);
  const initInventario = useInventarioStore((s) => s.initSocket);
  const initDespacho   = useDespachoStore((s) => s.initSocket);

  useEffect(() => {
    const cleanVentas     = initVentas();
    const cleanInventario = initInventario();
    const cleanDespacho   = initDespacho();

    return () => {
      cleanVentas();
      cleanInventario();
      cleanDespacho();
    };
  }, []);
}