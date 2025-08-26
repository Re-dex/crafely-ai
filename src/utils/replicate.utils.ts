export type ReplicateOutput = string | Uint8Array | Buffer | any;

const toDataUrl = (mime: string, buffer: Buffer) =>
  `data:${mime};base64,${buffer.toString("base64")}`;

export async function normalizeReplicateOutputs(
  result: ReplicateOutput | ReplicateOutput[]
): Promise<string | string[]> {
  const outputs = Array.isArray(result) ? result : [result];
  const urls = await Promise.all(
    outputs.map(async (item: any) => {
      if (typeof item === "string") return item;

      if (Buffer.isBuffer(item) || item instanceof Uint8Array) {
        const buf = Buffer.isBuffer(item) ? item : Buffer.from(item);
        return toDataUrl("image/png", buf);
      }

      if (item && typeof item === "object") {
        const anyOut: any = item as any;
        if (typeof anyOut.url === "string") return anyOut.url;

        if (typeof anyOut.buffer === "function") {
          const maybeBuffer = await anyOut.buffer();
          const buf = Buffer.isBuffer(maybeBuffer)
            ? maybeBuffer
            : maybeBuffer instanceof ArrayBuffer
            ? Buffer.from(new Uint8Array(maybeBuffer))
            : Buffer.from(maybeBuffer);
          const mime = anyOut.mimeType || anyOut.mime || "image/png";
          return toDataUrl(mime, buf);
        }

        if (typeof anyOut.arrayBuffer === "function") {
          const ab: ArrayBuffer = await anyOut.arrayBuffer();
          const buf = Buffer.from(ab);
          const mime = anyOut.mimeType || anyOut.mime || "image/png";
          return toDataUrl(mime, buf);
        }

        if (
          typeof ReadableStream !== "undefined" &&
          item instanceof ReadableStream
        ) {
          const ab: ArrayBuffer = await new Response(item as any).arrayBuffer();
          const buf = Buffer.from(ab);
          const mime = anyOut?.mimeType || anyOut?.mime || "image/png";
          return toDataUrl(mime, buf);
        }
      }

      const json = Buffer.from(JSON.stringify(item));
      return toDataUrl("application/json", json);
    })
  );

  return urls.length === 1 ? urls[0] : urls;
}
