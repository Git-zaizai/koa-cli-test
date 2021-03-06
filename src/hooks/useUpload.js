import fs, {existsSync, mkdirSync} from 'fs'
import {join} from "path";
import {pathUpload, imgpath, imgType} from '../config/path-upload.js'

/**
 * @function 查看文件夹是否存在，不存在则创建
 * @param path:string 文件路径
 * */
export function testingFileFolder(path) {
    if (!existsSync(path)) {
        mkdirSync(path)
    }
}

/**
 * @function FileFolderName 文件夹名
 * @return string YY-MM-DD
 * */
export function FileFolderName() {
    const _date = new Date()
    let Y = _date.getFullYear(),
        m = _date.getMonth() + 1,
        d = _date.getDate();
    m = m < 10 ? '0' + m : m;
    d = d < 10 ? '0' + d : d;
    return Y + '-' + m + '-' + d;
}

/**
 * @function writeToFlie 写入文件函数
 * @param filepath 读取二进制文件路径
 * @param savepath 保存文件 | 写入路径
 * @returns Promise {code: 200 成功 | 500 失败, msg: 提示, error: 错误对象}
 * */
export function writeToFlieAsync(filepath, savepath) {
    return new Promise((resolve, reject) => {
        try {
            // 创建可读流  （读取上传的文件）
            const reader = fs.createReadStream(filepath);
            // 创建可写流
            // const readerpath = join(path, rename)// 写入路径
            const upStream = fs.createWriteStream(savepath);
            // 可读流通过管道写入可写流  (写入文件)
            reader.pipe(upStream);

            reader.on('close', () => {
                console.log('文件已关闭！流结束')
                resolve({code: 200, msg: '文件写入完成'})
            })
        } catch (e) {
            reject({code: 500, mag: '文件写入错误', error: e})
        }
    })
}

/**
 * @function useUpload 文件上传处理
 * @param file 上传的 file 类型对象
 * @return Promise {
 *                  name：原始文件名，
 *                  type：文件类型,
 *                  size：重命名文件，
 *                  rename：重命名文件，
 *                  savepath：文件保存路径,
 *                  file：上传的二进制文件路径,
 *                  lastModifiedDate：文件上传时间
 *                 }
 *                 error:
 *                 {
 *                   code:500,
 *                   msg: '意外错误! 文件写入错误!',
 *                   error: 错误对象
 *                 }
 * */
export async function useUpload(file) {
    try {
        // 原始文件名
        const name = file.name
        // 文件类型
        const type = file.type.split('/').pop()
        // 文件大小
        const size = file.size
        // 重命名文件
        const rename = file.path.split('_').pop()
        // 文件上传时间
        const lastModifiedDate = file.lastModifiedDate

        let fileFolder;
        // 判断是不是图片类型
        if (imgType.includes(type)) {
            fileFolder = imgpath
        } else {
            fileFolder = pathUpload
        }

        // 拿到今天的文件夹名字
        const datepath = FileFolderName()
        // 组成文件夹路径
        fileFolder = join(fileFolder, datepath)
        //查看文件夹是否存在
        testingFileFolder(fileFolder)
        // 文件保存路径
        const savepath = join(fileFolder, rename + '.' + type)

        await writeToFlieAsync(file.path, savepath);

        return {name, type, size, rename, savepath, path: file.path, lastModifiedDate}
    } catch (e) {
        return {code: 500, msg: '意外错误! 文件写入错误!', error: e}
    }
}