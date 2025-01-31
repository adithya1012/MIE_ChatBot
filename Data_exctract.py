import nltk
import ssl

try:
    _create_unverified_https_context = ssl._create_unverified_context
except AttributeError:
    pass
else:
    ssl._create_default_https_context = _create_unverified_https_context

nltk.download('punkt_tab')
nltk.download('averaged_perceptron_tagger_eng')

from unstructured.partition.pdf import partition_pdf
from unstructured.staging.base import elements_to_json
from unstructured.partition.pdf import partition_pdf
from unstructured.documents.elements import Table, Image

pdf_file_path = "Patient_record_image.pdf"



elements = partition_pdf(
    filename=pdf_file_path,
    # strategy="hi_res",
    extract_images_in_pdf=True,
    infer_table_structure=True,
    chunking_strategy=None,
    extract_image_block_to_payload=True # commenting this will create a figure folder with all the images. This is to convert base64
    # chunking_strategy="by_title",
    # max_characters=4000,
    # new_after_n_chars=3800,
    # combine_text_under_n_chars=2000,
    # image_output_dir_path="images",
    # chunking_overlap=0,
    # extract_image_block_output_dir="images",
    # model_name = "yolox"
)

# TODO: use chucking stratergy by title. or chunk by similarity

import os
from langchain_google_vertexai import ChatVertexAI
from langchain.schema.messages import HumanMessage

os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = "Google-service-account-credential.json"
llm = ChatVertexAI(
    model="gemini-1.5-flash-001"
)

def image_summarize(image_base64):
  msg = llm.invoke( # This line creates the initial call to the model
      [
          HumanMessage(
              content=[
                  {"type": "text", "text" : "Please give a summary of the image provided. Be descriptive. From the image explain what are the anomalies and your thoughts "},
                  {
                      "type": "image_url",
                      "image_url": {
                          "url": f"data:image/jpeg;base64,{image_base64}"
                      },
                  },
              ]
          )
      ]
  )
  return msg.content

def merge_chunks(elements):
    content = []
    current_chunk = []

    for element in elements:
        if isinstance(element, Image):
            # print(image_summarize(element.metadata.image_base64))
            # print("____________________________________")
            content.append("<image> "+image_summarize(element.metadata.image_base64)+" </image>")
        else:
            content.append(str(element))

    content_str = ''.join(e+" " for e in content)

    return content_str

content = merge_chunks(elements)
# print(content)

