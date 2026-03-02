import { api } from '@/services/api';

/**
 * Upload file lên Cloudflare R2 thông qua Presigned URL
 */
export const uploadFileToR2 = async (file: File): Promise<string> => {
    try {
        console.log("Bắt đầu upload:", file.name); // Debug log

        // 1. Gọi API Backend để lấy Presigned URL
        // Endpoint này yêu cầu Auth, giờ api.ts đã fix nên sẽ gửi kèm Token
        const res: any = await api.post('/storage/presigned', {
            fileName: file.name,
            fileType: file.type
        });
        
        const { uploadUrl, fileUrl } = res;

        if (!uploadUrl) {
            throw new Error("Không lấy được uploadUrl từ server (Response rỗng)");
        }

        // 2. Upload trực tiếp file từ Browser lên R2
        // Lưu ý: Fetch này KHÔNG cần token của app, mà dùng token trong chính URL presigned
        const uploadRes = await fetch(uploadUrl, {
            method: 'PUT',
            body: file,
            headers: {
                // Quan trọng: Không thêm Authorization header ở đây vì sẽ làm hỏng Presigned URL của R2/S3
            }
        });

        if (!uploadRes.ok) {
            throw new Error(`R2 Upload failed: ${uploadRes.status} ${uploadRes.statusText}`);
        }

        console.log("Upload thành công:", fileUrl);
        return fileUrl; 
    } catch (error) {
        console.error("Lỗi upload file:", error);
        throw error;
    }
};