export const useApi = async (url: string, responseCallBack: (data: any) => void) => {
    
    const response = await fetch(url);
    const data = await response.json();

    return {
        data: responseCallBack(data)
    }
}