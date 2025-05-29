export function formatModelType(type?: string): string {
  switch (type) {
    case 'TISSUE':
      return 'Tissue';
    case 'CELL':
      return 'Cell';
    case 'MULTI':
      return 'Multi';
    default:
      return 'Tissue'; // 기본값
  }
}
