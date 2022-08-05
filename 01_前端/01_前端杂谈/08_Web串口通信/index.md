# Web串口通信

[Web Serial API](https://wicg.github.io/serial/) 是一套允许网站从串行设备通过脚本读取和写入的方式微控制器、3D 打印机和其他串行设备等设备进行通信的一套 API。

要注意的是, Web Serial API 比较新, 建议只在最新版谷歌浏览器使用。同时出于安全考虑，Web Serial API 只被允许运行在使用 https 的网站上，一些方法的调用必须通过用户操作执行。

## 支持检测

检查浏览器是否支持 Web Serial API：

```js
if ("serial" in navigator) {
  // 浏览器支持串口通信
}
```

## 打开串口

**requestPort** 方法来提示用户选择一个串口，或者使用 **getPorts** 方法从先前授予过访问权限的串口列表中选择一个。

```js
// 提示用户选择一个串口
const port = await navigator.serial.requestPort();
// 获取用户之前授予该网站访问权限的所有串口
const ports = await navigator.serial.getPorts();

// 打开串口
await port.open({
  dataBits: 8, // 数据位
  stopBits: 1, // 停止位
  parity: "none", // 奇偶校验
  baudRate: 9600, // 波特率
});
```

## 读取数据

Web Serial API 中的输入和输出流由 [streams API](https://developer.mozilla.org/en-US/docs/Web/API/Streams_API) 处理。

串口打开成功之后，[SerialPort](https://developer.mozilla.org/en-US/docs/Web/API/SerialPort) 对象的 [readable](https://developer.mozilla.org/en-US/docs/Web/API/SerialPort/readable) 和 [writable](https://developer.mozilla.org/en-US/docs/Web/API/SerialPort/writable) 属性返回一个 [ReadableStream](https://developer.mozilla.org/en-US/docs/Web/API/ReadableStream) 和一个 [WritableStream](https://developer.mozilla.org/en-US/docs/Web/API/WritableStream)用于串口通信交互传输数据。Web Serial API 使用 Uint8Array 实例进行数据传输。

使用 **port.readable.getReader** 来初始化获取一个数据读取器。初始化之后，这个数据读取器会被锁定为 readable。此时串口不能关闭，直到数据读取器的 releaseLock 方法被调用。

当接收到串口数据时，调用数据读取器的 read 方法会异步返回两个属性:

- value（Uint8Array）
- done （Boolean）

如果 done 为 true，表示此时串口没有正在接收的数据传入或串口已经关闭：

```js
const reader = port.readable.getReader();
// 监听来自串口的数据
while (true) {
  const { value, done } = await reader.read();
  if (done) {
    // 允许稍后关闭串口
    reader.releaseLock();
    break;
  }
  // value 是一个 Uint8Array
  console.log(value);
}
```

使用 String.fromCharCode 方法可以处理 Uint8Array 为 字符串。

## 写入数据

和读取数据类似，写入数据也需要初始化一个数据读取器，同时要将数据转为 Uint8Array。

```js
await writer.write(
  new Uint8Array("hello".split("").map((s) => s.charCodeAt(0)))
);
```

## 串口关闭

使用 port 的 close 方法可以关闭串口，前提是串口的 readable 和 writable 被解锁，调用其上的 releaseLock 方法即可解锁。

当想要在在串口接受数据过程中关闭串口，需要调用 reader 的 cancel 方法将 reader.read()的返回值变为为 {value: undefined, done: true}，从而允许调用 reader.releaseLock。最后调用 port 的 close 方法。

## Electron

在 Electron 中使用 Web Serial API 需要在主进程监听渲染进程 webContents.session 的 select-serial-port 事件处理返回一个 portId。这一步相当于用户手动选择串口设备。

## 与 8051 单片机通信

这里实现了一个可以接收和发送串口数据的 8051 单片机和 Web 交互示例，实现了 Web 驱动单片机蜂鸣器和单片机独立按键状态反馈至 Web 页面效果：

**C:**

```c
#include <regx52.h>

void InitPort()
{
	SCON = 0X50;
	TMOD = 0X20;
	PCON = 0X00;
	TH1 = 0Xfd;
	TL1 = 0Xfd;
	ES = 1;
	EA = 1;
	TR1 = 1;
}

void delay(unsigned int xms)
{
	unsigned int i, j;
	for (i = xms; i > 0; i--)
		for (j = 112; j > 0; j--);
}

void main()
{
	InitPort();
	do
	{
		if (P3_4 == 0) {
			delay(1);
			SBUF = '1';
			break;
		}
		if (P3_5 == 0) {
			delay(1);
			SBUF = '2';
			break;
		}
		if (P3_6 == 0) {
			delay(1);
			SBUF = '3';
			break;
		}
		if (P3_7 == 0) {
			delay(1);
			SBUF = '4';
			break;
		}
		SBUF = '0';
	} while (1);
}

void uart() interrupt 4
{
	if (RI == 1)
	{
		RI = 0;
		P2_3 = 0;
		delay(50);
		P2_3 = 1;
		delay(50);
		P2_3 = 0;
		delay(50);
		P2_3 = 1;
		delay(50);
		P2_3 = 0;
		delay(50);
		P2_3 = 1;
		delay(50);
	}
}

```

**HTML:**

```html
<!DOCTYPE html>
<html lang="zh">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Document</title>
    <style>
      html,
      body {
        height: 100%;
        user-select: none;
      }
      .flex {
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .flexc {
        flex-direction: column;
      }
      .k {
        width: 66px;
        height: 66px;
        color: #000;
        margin: 0 4px;
        font-size: 30px;
        font-weight: bold;
        border-radius: 4px;
        background: #fff;
        border: 1px solid #aaa;
      }
    </style>
  </head>
  <body class="flex flexc">
    <button id="open">打开串口</button>
    <br />
    <button id="close" style="display: none">关闭串口</button>
    <br />
    <button id="ring" style="display: none">蜂鸣器</button>
    <br />
    <div id="key" class="flex">
      <div id="k1" class="flex k">K2</div>
      <div id="k2" class="flex k">K3</div>
      <div id="k3" class="flex k">K4</div>
      <div id="k4" class="flex k">K5</div>
    </div>
    <script>
      const open = document.getElementById("open");
      const ring = document.getElementById("ring");
      const close = document.getElementById("close");
      const ks = Array.from(document.getElementById("key").children);

      let port,
        reader,
        writer,
        opened = false;
      const render = (value) => {
        ks.forEach((k) => {
          k.style.color = "#000";
          k.style.background = "#fff";
        });
        if (value && !isNaN(value)) {
          ks[value - 1].style.color = "#fff";
          ks[value - 1].style.background = "#f00";
        }
      };
      const init = (_port) => {
        if (!_port) {
          return;
        }
        port = _port;
        close.style.display = ring.style.display = "block";
        port.open({ baudRate: 9600 }).then(async () => {
          opened = true;
          reader = port.readable.getReader();
          writer = port.writable.getWriter();
          while (port.readable && opened) {
            while (true) {
              let { value, done } = await reader.read();
              if (done) {
                reader.releaseLock();
                writer.releaseLock();
                port.close();
                break;
              }
              render(+String.fromCharCode(value));
            }
          }
        });
      };
      navigator.serial
        .getPorts()
        .then(([port]) => {
          init(port);
        })
        .catch(console.log);
      open.onclick = () => {
        navigator.serial
          .requestPort()
          .then(init)
          .catch(console.log);
      };
      close.onclick = () => {
        opened = false;
        ring.style.display = close.style.display = "none";
        reader.cancel();
      };
      ring.onclick = () => {
        writer.write(new Uint8Array("0".split("").map((s) => s.charCodeAt(0))));
      };
    </script>
  </body>
</html>
```

## 示例预览

[https://yinchengnuo.com/serial](https://yinchengnuo.com/serial)