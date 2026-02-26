export function downloadFile(url: string, filename: string): void {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function downloadAllFiles(
  items: { imageUrl: string; name: string }[],
  delayMs = 200
): void {
  items.forEach((item, idx) => {
    setTimeout(() => downloadFile(item.imageUrl, `${item.name}.png`), idx * delayMs);
  });
}
