'use client'; // 标记为客户端组件

import { ConnectButton, useCurrentAccount, useSignPersonalMessage } from '@mysten/dapp-kit';
import { verifyPersonalMessageSignature } from '@mysten/sui/verify'; // 导入验证函数
import { useState } from 'react';

export default function Home() {
  const { mutate: signPersonalMessage } = useSignPersonalMessage();
  const [message, setMessage] = useState('你好，Sui 钱包！');
  const [signature, setSignature] = useState('');
  const [verificationResult, setVerificationResult] = useState<boolean | null>(null);
  const currentAccount = useCurrentAccount();

  const handleVerifySignature = async () => {
    if (!currentAccount || !signature || !message) {
      console.error("缺少验证所需的信息：账户、签名或消息");
      setVerificationResult(false);
      return;
    }
    setVerificationResult(null);

    try {
      const messageBytes = new TextEncoder().encode(message);
      await verifyPersonalMessageSignature(
         messageBytes,
         signature,
         { address: currentAccount.address }
      );
      setVerificationResult(true);
      console.log("验证结果: 成功");
    } catch (error) {
      console.error("验证签名时出错或签名无效:", error);
      setVerificationResult(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 space-y-8">
      <h1 className="text-4xl font-bold">Sui 钱包登录演示</h1>
      <ConnectButton />
      {currentAccount && (
        <div className="flex flex-col items-center space-y-4 p-6 border rounded-lg shadow-md w-full max-w-md">
          <p className="text-lg">已连接地址: <code className="text-sm bg-gray-100 p-1 rounded">{currentAccount.address}</code></p>
          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700">
              签名消息:
              <input
                type="text"
                value={message}
                onChange={(ev) => {
                    setMessage(ev.target.value);
                    setSignature('');
                    setVerificationResult(null);
                }}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </label>
          </div>
          <button
            onClick={() => {
              setSignature('');
              setVerificationResult(null);
              const originalMessageBytes = new TextEncoder().encode(message);
              signPersonalMessage(
                {
                  message: originalMessageBytes,
                },
                {
                  onSuccess: (result) => {
                    console.log("签名成功:", result);
                    setSignature(result.signature);
                  },
                  onError: (error) => {
                    console.error("签名失败:", error);
                    setSignature("签名失败");
                  }
                },
              );
            }}
            className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            使用钱包签名消息
          </button>

          {/* 显示签名结果 & 验证区域 */}
          {signature && signature !== "签名失败" && (
            <div className="mt-4 p-4 border rounded w-full break-words space-y-4">
              <div>
                <p><strong>签名 (Base64):</strong></p>
                <code className="text-xs block overflow-x-auto bg-gray-50 p-2 rounded">{signature}</code>
              </div>
              <button
                onClick={handleVerifySignature}
                disabled={!signature || signature === "签名失败"}
                className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                验证签名
              </button>
              {verificationResult !== null && (
                <p className={`mt-2 text-center font-semibold ${verificationResult ? 'text-green-700' : 'text-red-700'}`}>
                  验证结果: {verificationResult ? '成功 ✔️' : '失败 ❌'}
                </p>
              )}
            </div>
          )}
          {signature === "签名失败" && (
             <p className="mt-4 text-red-600 font-semibold">签名失败，无法进行验证。</p>
           )}
        </div>
      )}
    </main>
  );
}
