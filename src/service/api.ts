export const sendToServerFunc = async (formData: any, serverApi: string | null) => {
  try {
    if (!serverApi) {
      return;
    }
    const response = await fetch(serverApi, {
      method: "POST",
      headers: {
        uploadFile: "file",
        "Content-Type": `multipart/form-data;`,
      },
      body: formData,
    });
    if (response.status === 404) {
      throw alert("Данные неполны: неверный url");
    }
  } catch (error) {
    console.log(error);
  }
};
