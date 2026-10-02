// Writes a zip file: only what the docs download needs, with no zip64, encryption, or comments.
// Paths ending in "/" are folders. The build compresses with Node's zlib. In the browser, which
// adds the reader's comments to the docs, files are stored uncompressed, since the docs are small.

const CRC_TABLE = (() => {
    const table = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
        let c = n;
        for (let k = 0; k < 8; k++) {
            c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
        }
        table[n] = c >>> 0;
    }
    return table;
})();

function crc32(data: Uint8Array): number {
    let crc = 0xffffffff;
    for (const byte of data) {
        crc = CRC_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8);
    }
    return (crc ^ 0xffffffff) >>> 0;
}

// The date and time in MS-DOS format, which zip uses.
function dosTime(date: Date): { time: number; date: number } {
    return {
        time: (date.getHours() << 11) | (date.getMinutes() << 5) | (date.getSeconds() >> 1),
        date: ((date.getFullYear() - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate(),
    };
}

export function zip(
    files: { path: string; content: string }[],
    modified: Date,
    deflateRaw?: (data: Uint8Array) => Uint8Array,
): Uint8Array<ArrayBuffer> {
    const encoder = new TextEncoder();
    const when = dosTime(modified);
    const parts: Uint8Array[] = [];
    const central: Uint8Array[] = [];
    let offset = 0;

    for (const file of files) {
        const name = encoder.encode(file.path);
        const folder = file.path.endsWith("/");
        const raw = encoder.encode(file.content);
        const data = deflateRaw && !folder ? deflateRaw(raw) : raw;
        const crc = folder ? 0 : crc32(raw);
        const method = deflateRaw && !folder ? 8 : 0;

        const local = new DataView(new ArrayBuffer(30));
        local.setUint32(0, 0x04034b50, true);
        local.setUint16(4, 20, true);
        // Bit 11: the name is UTF-8.
        local.setUint16(6, 0x0800, true);
        local.setUint16(8, method, true);
        local.setUint16(10, when.time, true);
        local.setUint16(12, when.date, true);
        local.setUint32(14, crc, true);
        local.setUint32(18, data.length, true);
        local.setUint32(22, raw.length, true);
        local.setUint16(26, name.length, true);
        local.setUint16(28, 0, true);
        parts.push(new Uint8Array(local.buffer), name, data);

        const entry = new DataView(new ArrayBuffer(46));
        entry.setUint32(0, 0x02014b50, true);
        // Made by Unix, so unzip tools apply the permissions below.
        entry.setUint16(4, (3 << 8) | 20, true);
        entry.setUint16(6, 20, true);
        entry.setUint16(8, 0x0800, true);
        entry.setUint16(10, method, true);
        entry.setUint16(12, when.time, true);
        entry.setUint16(14, when.date, true);
        entry.setUint32(16, crc, true);
        entry.setUint32(20, data.length, true);
        entry.setUint32(24, raw.length, true);
        entry.setUint16(28, name.length, true);
        entry.setUint32(38, ((folder ? 0o40755 : 0o100644) << 16) | (folder ? 0x10 : 0), true);
        entry.setUint32(42, offset, true);
        central.push(new Uint8Array(entry.buffer), name);

        offset += 30 + name.length + data.length;
    }

    const centralSize = central.reduce((sum, part) => sum + part.length, 0);
    const end = new DataView(new ArrayBuffer(22));
    end.setUint32(0, 0x06054b50, true);
    end.setUint16(8, files.length, true);
    end.setUint16(10, files.length, true);
    end.setUint32(12, centralSize, true);
    end.setUint32(16, offset, true);

    const all = [...parts, ...central, new Uint8Array(end.buffer)];
    const out = new Uint8Array(all.reduce((sum, part) => sum + part.length, 0));
    let at = 0;
    for (const part of all) {
        out.set(part, at);
        at += part.length;
    }
    return out;
}
