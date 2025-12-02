export const Skeleton = ({ height = 14, width = '100%', radius = 8 }: { height?: number; width?: number | string; radius?: number }) => (
  <div
    style={{
      height,
      width,
      borderRadius: radius,
      background: 'linear-gradient(90deg, rgba(12,30,66,0.08), rgba(12,30,66,0.16), rgba(12,30,66,0.08))',
      backgroundSize: '200% 100%',
      animation: 'skeleton 1.3s ease infinite',
    }}
  />
);

/* keyframes en línea globales */
const style = document.createElement('style');
style.innerHTML = `@keyframes skeleton { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }`;
document.head.appendChild(style);
