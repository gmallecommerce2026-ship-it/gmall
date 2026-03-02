import { cookies } from "next/headers";

export async function getServerToken(){
    try{
        const cookieStore = await cookies();
        return cookieStore.get('accessToken')?.value || null;
    }catch(err){
        console.error(err);
        return null;
    }
}