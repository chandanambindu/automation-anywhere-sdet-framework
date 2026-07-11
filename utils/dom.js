async function dragAndDrop(page, sourceLocator, targetLocator) {
  const srcHandle = await sourceLocator.elementHandle();
  const destHandle = await targetLocator.elementHandle();

  if (!srcHandle || !destHandle) {
    throw new Error('dragAndDrop: source or target element not found');
  }

  await page.evaluate(({ src, dest }) => {
    const source = src;
    const target = dest;
    const dataTransfer = new DataTransfer();

    const fire = (el, type) => {
      const event = new DragEvent(type, {
        bubbles: true,
        cancelable: true,
        dataTransfer,
      });
      el.dispatchEvent(event);
    };

    fire(source, 'dragstart');
    fire(target, 'dragenter');
    fire(target, 'dragover');
    fire(target, 'drop');
    fire(source, 'dragend');
  }, { src: srcHandle, dest: destHandle });

  await srcHandle.dispose();
  await destHandle.dispose();
}

module.exports = {
  dragAndDrop,
};
