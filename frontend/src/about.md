# DataChat
### AI-powered application for data analysis and ASR
#### Designed and built by Son Nguyen me@sonnguyen.online

This application employs modern AI technologies to implement two features: 

## Interactive Data Analysis

When you upload a datasheet file in CSV or Excel format that contains tabular data of any kind and shape,
DataChat uses OpenAI (with help from the Pandas AI library) to analyze the data for understanding.
Then you can start a conversation, asking everything about the data using natural English just like with a GPT chatbot.
DataChat can provide answers relevant to the data with facts, insights and calculations that may help you 
filter and query any aspects of the data and examine them. 
DataChat can also help you visualize the data by drawing tables and charts representing any range and subset of data 
and their relations, in any criteria.

Some typical questions you can ask:

> How many employees are paid above USD 20000?

> List the top 10 banks in terms of customer accounts

> Draw a chart for the sales volumes of every month in 2024


## Automatic Speech Recognition

When you upload a media file that contains content of either audio or video in common formats, 
DataChat uses OpenAI speech-to-text API to find speech in the content and detect the spoken language. It
then transcribes the speech to text, either in the original language or automatically translating to English
(DataChat only displays the translation option when a foreign language is detected).
Then DataChat allows you to play back the media with closed captions (subtitles) generated
from the transcript.

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
different preferences to get a sense of how this feature performs.

### Technical Specs
- Backend: Python processing engine using Nvidia GPU computing power
- API server: Fastapi
- Frontend: React application
