const OZON_LABEL_URL =
  "https://api-seller.ozon.ru/v2/posting/fbs/package-label";

export async function fetchOzonLabel(
  postingNumber,
  clientId,
  apiKey,
  signal
) {
  if (!postingNumber) {
    throw new Error("Не указан номер отправления Ozon");
  }

  if (!clientId) {
    throw new Error("Не указан Ozon Client-Id");
  }

  if (!apiKey) {
    throw new Error("Не указан Ozon Api-Key");
  }

  const response = await fetch(OZON_LABEL_URL, {
    method: "POST",

    headers: {
      "Client-Id": clientId,
      "Api-Key": apiKey,
      "Content-Type": "application/json",
      Accept: "application/pdf",
    },

    body: JSON.stringify({
      posting_number: [String(postingNumber).trim()],
    }),

    signal,
  });

  if (!response.ok) {
    const errorMessage = await getOzonErrorMessage(response);

    throw new Error(
      `Ozon API: ${response.status} ${errorMessage}`
    );
  }

  const contentType = response.headers.get("content-type") || "";

  if (!contentType.includes("application/pdf")) {
    const responseText = await response.text();

    throw new Error(
      `Ozon вернул неожиданный формат ответа: ${
        responseText || contentType || "неизвестный формат"
      }`
    );
  }

  return response.blob();
}

async function getOzonErrorMessage(response) {
  try {
    const responseText = await response.text();

    if (!responseText) {
      return response.statusText || "Неизвестная ошибка";
    }

    console.error("Полный ответ Ozon API:", responseText);

    try {
      const errorData = JSON.parse(responseText);

      const mainMessage =
        errorData.message ||
        errorData.error?.message ||
        errorData.error ||
        "Неизвестная ошибка Ozon";

      const details = Array.isArray(errorData.details)
        ? errorData.details
            .map((detail) => {
              if (typeof detail === "string") {
                return detail;
              }

              return (
                detail.message ||
                detail.reason ||
                detail.type ||
                JSON.stringify(detail)
              );
            })
            .join("; ")
        : "";

      return details
        ? `${mainMessage}: ${details}`
        : mainMessage;
    } catch {
      return responseText;
    }
  } catch {
    return response.statusText || "Неизвестная ошибка";
  }
}