async function dragAndDrop(page, sourceLocator, targetLocator) {
  const srcHandle = await sourceLocator.elementHandle();
  const destHandle = await targetLocator.elementHandle();

  if (!srcHandle || !destHandle) {
    throw new Error('dragAndDrop: source or target element not found');
  }

  try {
    // Try mouse-based drag which works across frames and complex canvases
    const srcBox = await srcHandle.boundingBox();
    const destBox = await destHandle.boundingBox();
    if (!srcBox || !destBox) throw new Error('Could not determine element bounds for drag');

    const startX = srcBox.x + srcBox.width / 2;
    const startY = srcBox.y + srcBox.height / 2;
    const endX = destBox.x + destBox.width / 2;
    const endY = destBox.y + destBox.height / 2;

    await page.mouse.move(startX, startY);
    await page.mouse.down();
    // interpolate a few steps for more realistic drag
    const steps = 12;
    for (let i = 1; i <= steps; i++) {
      const x = startX + (endX - startX) * (i / steps);
      const y = startY + (endY - startY) * (i / steps);
      await page.mouse.move(x, y);
    }
    await page.mouse.up();
  } finally {
    try { await srcHandle.dispose(); } catch (e) {}
    try { await destHandle.dispose(); } catch (e) {}
  }
}

module.exports = {
  dragAndDrop,
};
