'use client';
import React, { useState, useEffect, useRef } from 'react';
import { pointService } from '@/services/point.service';
import { X, Loader2, Send, ShieldCheck, User, ArrowRight, ChevronLeft, CheckCircle2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  friendName: string;
  friendId: string;
  onSuccess?: () => void;
}

const TransferModal: React.FC<TransferModalProps> = ({ 
  isOpen, onClose, friendName, friendId, onSuccess 
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1); // 1: Amount, 2: OTP, 3: Success
  const [amount, setAmount] = useState<string>('');
  const [otp, setOtp] = useState<string[]>(new Array(6).fill(""));
  const [loading, setLoading] = useState(false);
  const [myBalance, setMyBalance] = useState(0);

  // Focus input ref
  const amountInputRef = useRef<HTMLInputElement>(null);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setAmount('');
      setOtp(new Array(6).fill(""));
      // Lấy số dư hiện tại để hiển thị (UX)
      pointService.getMyPoints().then((res: any) => setMyBalance(res.points || 0));
      setTimeout(() => amountInputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // --- LOGIC XỬ LÝ OTP CAO CẤP ---
  const handleOtpChange = (element: HTMLInputElement, index: number) => {
    if (isNaN(Number(element.value))) return false;

    setOtp([...otp.map((d, idx) => (idx === index ? element.value : d))]);

    // Tự động focus ô tiếp theo
    if (element.value !== "" && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    // Xử lý nút Backspace
    if (e.key === "Backspace") {
      if (otp[index] === "" && index > 0) {
        otpInputRefs.current[index - 1]?.focus();
      } else {
        setOtp([...otp.map((d, idx) => (idx === index ? "" : d))]);
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6).split("");
    if (pastedData.every(char => !isNaN(Number(char)))) {
        const newOtp = [...otp];
        pastedData.forEach((val, i) => {
            if (i < 6) newOtp[i] = val;
        });
        setOtp(newOtp);
        // Focus vào ô cuối cùng được điền
        const focusIndex = Math.min(pastedData.length, 5);
        otpInputRefs.current[focusIndex]?.focus();
    }
  };
  // ------------------------------

  const handleInitiate = async () => {
    const value = Number(amount);
    if (!amount || value <= 0) return toast.error('Số xu phải lớn hơn 0');
    if (value > myBalance) return toast.error('Số dư không đủ');
    
    setLoading(true);
    try {
      await pointService.initiateTransfer(friendId, value);
      setStep(2);
      setTimeout(() => otpInputRefs.current[0]?.focus(), 100);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Lỗi gửi yêu cầu');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    const otpString = otp.join("");
    if (otpString.length < 6) return toast.error('Vui lòng nhập đủ 6 số OTP');

    setLoading(true);
    try {
      await pointService.confirmTransfer(otpString);
      setStep(3); // Chuyển sang màn hình Success
      if (onSuccess) onSuccess();
      
      // Tự động đóng sau 3s
      setTimeout(() => handleClose(), 3000);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'OTP không đúng hoặc hết hạn');
      setOtp(new Array(6).fill("")); // Reset OTP khi sai
      otpInputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
    setTimeout(() => {
        setStep(1);
        setAmount('');
        setOtp(new Array(6).fill(""));
    }, 300);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden relative transform transition-all animate-in zoom-in-95 duration-300 border border-white/20">
        
        {/* Decorative Header Background */}
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-b-[50%] scale-x-150 -translate-y-12 opacity-90 z-0"></div>

        {/* Close Button */}
        <button 
            onClick={handleClose} 
            className="absolute top-4 right-4 z-20 w-8 h-8 flex items-center justify-center bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full text-white transition-colors"
        >
            <X size={18} />
        </button>

        <div className="relative z-10 pt-8 pb-6 px-6">
          
          {/* STEP 1: NHẬP SỐ TIỀN */}
          {step === 1 && (
            <div className="flex flex-col items-center animate-in slide-in-from-right-10 fade-in duration-300">
                {/* Avatar Người Nhận */}
                <div className="w-20 h-20 rounded-full bg-white p-1 shadow-xl mb-3">
                    <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-2xl border-2 border-indigo-50">
                        {friendName.charAt(0).toUpperCase()}
                    </div>
                </div>
                
                <h3 className="text-gray-800 font-bold text-lg">{friendName}</h3>
                <p className="text-indigo-500 text-xs font-medium bg-indigo-50 px-3 py-1 rounded-full mt-1 mb-6">
                    Người nhận
                </p>

                {/* Input Số Tiền */}
                <div className="w-full mb-6">
                    <label className="block text-center text-gray-500 text-sm mb-2">Nhập số xu muốn chuyển</label>
                    <div className="relative w-full flex justify-center items-center">
                        <input 
                            ref={amountInputRef}
                            type="number" 
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="0"
                            className="w-full text-center text-5xl font-black text-gray-800 bg-transparent outline-none placeholder:text-gray-200"
                        />
                        <span className="absolute right-8 text-gray-400 font-bold text-lg pointer-events-none">XU</span>
                    </div>
                    {/* Đường kẻ dưới input */}
                    <div className="h-1 w-32 bg-gray-100 mx-auto mt-2 rounded-full overflow-hidden">
                        <div className={`h-full bg-indigo-500 transition-all duration-300 ${amount ? 'w-full' : 'w-0'}`}></div>
                    </div>
                    <p className="text-center text-xs text-gray-400 mt-3">
                        Số dư khả dụng: <span className="text-gray-600 font-bold">{myBalance.toLocaleString()} xu</span>
                    </p>
                </div>

                <button
                    onClick={handleInitiate}
                    disabled={loading || !amount}
                    className="w-full bg-gray-900 hover:bg-gray-800 text-white font-bold py-4 rounded-xl shadow-lg shadow-gray-200 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                    {loading ? <Loader2 className="animate-spin" /> : (
                        <>Tiếp tục <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /></>
                    )}
                </button>
            </div>
          )}

          {/* STEP 2: NHẬP OTP */}
          {step === 2 && (
            <div className="flex flex-col items-center animate-in slide-in-from-right-10 fade-in duration-300">
               <div className="w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center mb-4 text-green-500 relative">
                  <ShieldCheck size={32} />
                  <div className="absolute inset-0 border-4 border-green-100 rounded-full animate-pulse"></div>
               </div>

               <h3 className="text-gray-800 font-bold text-xl mb-1">Xác thực bảo mật</h3>
               <p className="text-gray-500 text-sm text-center px-4 mb-8">
                   Nhập mã 6 số chúng tôi vừa gửi tới email của bạn để xác nhận giao dịch.
               </p>

               {/* 6 Ô OTP Input Style */}
               <div className="flex gap-2 mb-8 justify-center w-full">
                   {otp.map((data, index) => (
                       <input
                           key={index}
                           ref={el => { otpInputRefs.current[index] = el }}
                           type="text"
                           maxLength={1}
                           value={data}
                           onChange={e => handleOtpChange(e.target, index)}
                           onKeyDown={e => handleOtpKeyDown(e, index)}
                           onPaste={handlePaste}
                           onFocus={e => e.target.select()}
                           className="w-10 h-12 sm:w-12 sm:h-14 border-2 border-gray-200 rounded-xl text-center text-xl font-bold text-gray-800 focus:border-green-500 focus:ring-4 focus:ring-green-100 outline-none transition-all caret-transparent"
                       />
                   ))}
               </div>

               <div className="flex gap-3 w-full">
                   <button 
                        onClick={() => setStep(1)}
                        className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl font-medium transition-colors"
                   >
                       Quay lại
                   </button>
                   <button
                        onClick={handleConfirm}
                        disabled={loading || otp.join("").length < 6}
                        className="flex-[2] bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-green-200 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : 'Xác nhận chuyển'}
                    </button>
               </div>
            </div>
          )}

          {/* STEP 3: SUCCESS */}
          {step === 3 && (
              <div className="flex flex-col items-center justify-center py-6 animate-in zoom-in fade-in duration-500">
                  <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-4 animate-bounce">
                      <CheckCircle2 size={48} />
                  </div>
                  <h3 className="text-2xl font-black text-gray-800 mb-2">Thành công!</h3>
                  <p className="text-gray-500 text-center">
                      Bạn đã chuyển <span className="font-bold text-gray-800">{Number(amount).toLocaleString()} xu</span> cho <br/> 
                      <span className="font-bold text-indigo-600">{friendName}</span>
                  </p>
                  
                  <div className="mt-8 w-full bg-gray-50 rounded-xl p-4 border border-dashed border-gray-200 text-center text-xs text-gray-400">
                      Cửa sổ sẽ tự đóng trong giây lát...
                  </div>
              </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default TransferModal;