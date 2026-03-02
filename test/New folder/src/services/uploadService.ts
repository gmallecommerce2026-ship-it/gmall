import { api } from '@/services/api';

/**
 * Upload file lên Cloudflare R2 thông qua Presigned URL
 * @param file File object từ input input[type="file"]
 * @returns Public URL của file sau khi upload thành công
 */
export const uploadFileToR2 = async (file: File): Promise<string> => {
    try {
        // 1. Gọi API Backend để lấy Presigned URL (URL ký sẵn)
        const res = await api.post('/storage/presigned', {
            fileName: file.name,
            fileType: file.type
        });
        
        const { uploadUrl, fileUrl } = res.data;

        // 2. Upload trực tiếp file từ Browser lên R2 bằng lệnh PUT
        // Lưu ý: Dùng fetch() native thay vì axios instance để tránh bị dính BaseURL của API
        const uploadRes = await fetch(uploadUrl, {
            method: 'PUT',
            body: file,
            headers: {
                'Content-Type': file.type,
                // 'x-amz-acl': 'public-read' // Bỏ comment nếu bucket yêu cầu ACL
            }
        });

        if (!uploadRes.ok) {
            throw new Error(`Upload failed with status: ${uploadRes.status}`);
        }

        // 3. Trả về URL công khai để lưu vào Database
        return fileUrl; 
    } catch (error) {
        console.error("Lỗi upload file:", error);
        throw error;
    }
};