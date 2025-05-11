# DataChat
### AI-powered application for data analysis and ASR
#### Designed and built by Son Nguyen me@sonnguyen.online

This project employs modern AI technologies to implement and showcase two features of great potential use: 

## Interactive Data Analysis

When you upload a datasheet file in CSV or Excel format that contains tabular data of any kind and shape,
DataChat uses OpenAI (with help from the _Pandas AI_ library) to parse the data for analysis.
Then you can start a conversation, asking everything about the data using natural English just like with a GPT chatbot.
DataChat can provide answers relevant to the data with reasonings, insights and calculations that may help you 
filter and query any aspects of the data and examine them. 
DataChat can also help you visualize the data by drawing tables and charts representing any range and subset of data 
and their relations, in any criteria.
Actually, DataChat serves as a minimal version of what _LlamaIndex_ calls a _knowledge assistant_, but purely homemade.
I built this project from the ground up this way as part of an early research on how to implement a human-LLM interface
for data analysis using the knowledge and experience I was assimilating.

Some typical questions you can ask:

> How many employees are paid above USD 20000?

> List the top 10 banks in terms of customer accounts

> Draw a chart for the sales volumes of every month in 2024


## Automatic Speech Recognition

When you upload a media file that contains content of either audio or video in common formats, 
DataChat uses _OpenAI_ speech-to-text API to find speech in the content and detect the spoken language. It
then transcribes the speech to text, either in the original language or automatically translating to English
(DataChat only displays the translation option when a foreign language is detected).
Then DataChat allows you to play back the media with closed captions (subtitles) generated
from the transcript. For later use, you can download the transcript in SRT format to load in 
a media player or add to your content production workflow.

You can configure the transcription by tuning preset performance levels, balancing between speed and accuracy.
For long media, you can choose to transcribe partially to save time, useful for testing.

Pay attention to the description, which will be served as an additional prompt to the AI model. This allows
you to provide context to help the AI understand more about the speech. Another common use is providing corrections of
spelling errors of terms that the AI is not familiar with, especially in faster levels.
For example, in the first run the transcript contains incorrect guesses of words and acronyms
specific to the domain of your data. Then in subsequent runs you should help fix those
by listing your corrections in the description (just a list of words usually suffices). 
The AI is then informed and knows where and how to correct the errors. This is a more cost-effective
way to improve accuracy than raising the performance level to Accurate, which may cost too much time.

DataChat also provides information about the media and the transcription process that, among other things, helps you 
estimate the time and cost the operation may incur to forecast them for a real use case, before making decisions about processing real data.

For testing, try some short media files (recommended just a few minutes) and/or use a faster level
as it may take a long time to transcribe long durations.
For a quick preview, you can use this [1-minute sample video](/sprite-flight-1m.mp4) and try tweaking 
different preferences to get a sense of how this feature performs (which vary depending on the content;
for this video the recommended starting level is Balanced). 
For translation, try this [French speech sample audio](/french.mp3).

### Technical Specs
- Backend: Python processing engine using Nvidia GPU computing power
- API server: _FastAPI_
- Frontend: _React_ application
