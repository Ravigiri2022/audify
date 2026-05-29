import ffmpeg from 'fluent-ffmpeg'
import ffmpegStatic from 'ffmpeg-static'
import { Readable } from 'stream'
import path from 'path'
import os from 'os'
import fs from 'fs/promises'
import { randomBytes } from 'crypto'

ffmpeg.setFfmpegPath(ffmpegStatic as string)

/**
 * Run an ffmpeg operation on an in-memory Buffer.
 *
 * @param inputBuffer  Raw bytes of the source audio file
 * @param inputExt     Extension of the source file, e.g. "mp3" (no leading dot)
 * @param args         Additional ffmpeg arguments inserted between -i <input> and <output>
 * @param outputExt    Extension for the output file, e.g. "mp3" (no leading dot)
 * @returns            Output file contents as a Buffer
 */
export async function processWithFFmpeg(
  inputBuffer: Buffer,
  inputExt: string,
  args: string[],
  outputExt: string
): Promise<Buffer> {
  const id = randomBytes(8).toString('hex')
  const tmpDir = os.tmpdir()
  const inputPath = path.join(tmpDir, `audify_in_${id}.${inputExt}`)
  const outputPath = path.join(tmpDir, `audify_out_${id}.${outputExt}`)

  // Write the input buffer to a temporary file
  await fs.writeFile(inputPath, inputBuffer)

  try {
    await runFfmpeg(inputPath, args, outputPath)
    const outputBuffer = await fs.readFile(outputPath)
    return outputBuffer
  } finally {
    // Always clean up temp files, ignoring errors if they don't exist
    await fs.unlink(inputPath).catch(() => {})
    await fs.unlink(outputPath).catch(() => {})
  }
}

function runFfmpeg(
  inputPath: string,
  args: string[],
  outputPath: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    let cmd = ffmpeg(inputPath)

    // Pass the extra args as output options
    if (args.length > 0) {
      cmd = cmd.outputOptions(args)
    }

    cmd
      .output(outputPath)
      .on('end', () => resolve())
      .on('error', (err: Error) => reject(err))
      .run()
  })
}
