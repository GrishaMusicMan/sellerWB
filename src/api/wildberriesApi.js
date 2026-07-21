const WB_STICKERS_URL =
  "https://marketplace-api.wildberries.ru/api/v3/orders/stickers?type=png&width=58&height=40";

function getErrorMessage(status, responseData) {
  switch (status) {
    case 400:
      return (
        responseData?.detail ||
        responseData?.title ||
        "Wildberries отклонил запрос. Проверьте номер задания."
      );

    case 401:
      return "Токен Wildberries недействителен или истёк. Обновите токен.";

    case 403:
      return "У токена Wildberries недостаточно прав для получения этикеток.";

    case 429:
      return "Wildberries временно ограничил запросы. Слишком много обращений к API.";

    default:
      return (
        responseData?.detail ||
        responseData?.title ||
        `Ошибка Wildberries API. Код ответа: ${status}.`
      );
  }
}

export async function fetchWildberriesSticker(orderId, token, signal) {
  if (!token) {
    throw new Error("Не указан токен Wildberries.");
  }

  const numericOrderId = Number(orderId);

  if (!Number.isFinite(numericOrderId)) {
    throw new Error(`Некорректный номер задания Wildberries: ${orderId}`);
  }

  const response = await fetch(WB_STICKERS_URL, {
    method: "POST",
    headers: {
      Accept: "application/json",
      Authorization: token,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      orders: [numericOrderId],
    }),
    signal,
  });

  let responseData = null;

  try {
    responseData = await response.json();
  } catch {
    // Некоторые ошибки API могут прийти без корректного JSON.
  }

  if (!response.ok) {
    throw new Error(getErrorMessage(response.status, responseData));
  }

  const sticker = responseData?.stickers?.[0];

  if (!sticker?.file) {
    throw new Error(
      `Wildberries не вернул этикетку для задания ${orderId}.`
    );
  }

  return sticker;
}