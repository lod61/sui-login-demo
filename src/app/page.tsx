'use client'; // 标记为客户端组件

import { ConnectButton, useCurrentAccount, useSignPersonalMessage } from '@mysten/dapp-kit';
import { useState } from 'react';

export default function Home() {
  const { mutate: signPersonalMessage } = useSignPersonalMessage();
  const [message, setMessage] = useState('你好，Sui 钱包！'); // 预设登录消息
  const [signature, setSignature] = useState('');
  const [digest, setDigest] = useState(''); // 用于存储消息摘要
  const currentAccount = useCurrentAccount();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 space-y-8">
      <h1 className="text-4xl font-bold">Sui 钱包登录演示</h1>

      {/* 连接/断开按钮 */}
      <ConnectButton />

      {/* 如果已连接钱包 */}
      {currentAccount && (
        <div className="flex flex-col items-center space-y-4 p-6 border rounded-lg shadow-md w-full max-w-md">
          <p className="text-lg">已连接地址: <code className="text-sm p-1 rounded">{currentAccount.address}</code></p>

          {/* 消息输入 */}
          <div className="w-full">
            <label className="block text-sm font-medium text-black">
              签名消息:
              <input
                type="text"
                value={message}
                onChange={(ev) => setMessage(ev.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </label>
          </div>

          {/* 签名按钮 */}
          <button
            onClick={() => {
              signPersonalMessage(
                {
                  message: new TextEncoder().encode(message), // 将消息编码为 Uint8Array
                },
                {
                  onSuccess: (result) => {
                    console.log("签名成功:", result);
                    setSignature(result.signature);
                    setDigest(result.bytes); // .bytes 包含原始消息的 Base64 编码
                  },
                  onError: (error) => {
                    console.error("签名失败:", error);
                    setSignature("签名失败");
                    setDigest("");
                  }
                },
              );
            }}
            className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            使用钱包签名消息
          </button>

          {/* 显示签名结果 */}
          {signature && (
            <div className="mt-4 p-4 border rounded w-full break-words">
              <p><strong>签名 (Base64):</strong></p>
              <code className="text-xs">{signature}</code>
              <p className="mt-2"><strong>消息摘要 (Base64):</strong></p>
              <code className="text-xs">{digest}</code>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
