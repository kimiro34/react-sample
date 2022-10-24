import axios from 'axios'
import { REQUEST_API_URL } from '../Config/constant'

export const SaveAction = async(id:number, name:string, value: any) => {
    const res = await axios.post(`${REQUEST_API_URL}/update/${id}`, {
        name: name,
        value: value
      });
    if (res) {
        if (res?.status === 200) {
            return true;
        }
    }
    return true;
}

export const CancelAction = async(id:number) => {
    const res = await axios.post(`${REQUEST_API_URL}/cancel/${id}`);
    if (res) {
        if (res?.status === 200) {
            return true;
        }
    }
    return true;
}