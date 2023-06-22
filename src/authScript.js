import "./styles.css";
import axios from "axios";
import { getOAuthUrl, getUuid } from "./helper";
import { get as _get, forEach as _forEach, isEmpty as _isEmpty, head } from "lodash-es"
const apiKey = '0e6Xk0bzzJdp7heWFk5AM5zkc4I';
const baseSourceName = 'testint';
const newSourceNamePrefix = 'gaurav';
const apiUrl = `http://localhost:8080`;

(function () {
  const headers = { "Content-Type": "application/json" };
  const bearerToken = `Bearer ${apiKey}`;
  console.log(headers)
  let oAuthEQP = null;
  let userId = null;
  let sessionState = null;
  const submitElement = document.querySelector("#submit-button");
  submitElement.addEventListener('click', () => {
    initProcess();
  })



  const initTemplateSource = async()  => {
    const config = {
      headers: {
        ...headers,
        Authorization: bearerToken
      },
      data: {
        apiKey, 
        baseSourceName,
        newSourceNamePrefix
      },
      url: `${apiUrl}/connector-studio/integration-setup/init-template-source`,
      method: "POST"
    }
    return await axios.request(config);
  }

  const initProcess = async() => {
    try {
      const secondResponse = await initTemplateSource();
      const getOAuthProperties = getOAuthUrl(_get(secondResponse, 'data.stepJson'));
      sessionState = _get(secondResponse, 'data.sessionState');
      userId = _get(secondResponse, 'data.userId');
      const authWindow = window.open(getOAuthProperties, '_blank')
      if (_isEmpty(authWindow)) {
        console.log('Please enable toaster')
      }
      window.addEventListener('message', (e) => {
        receiveMessage(e, authWindow);
      } , false);

    } catch (error) {
      console.log(error)
    }
  }

  const receiveMessage = (event, childWindow) => {
    if (event.data.href === undefined) {
      console.log('eerrorrr')
      window.removeEventListener('message', (e) => {
        receiveMessage(e, childWindow);
      });
    } else if (event.data.href.includes('/close')) {
      const urlParams = new URLSearchParams(_get(event, 'data.search'));
      oAuthEQP = urlParams.get("eqp");
      childWindow.close();
      window.removeEventListener('message', (e) => {
        receiveMessage(e, childWindow);
      });
      saveTemplateSource(oAuthEQP)

    } else if (event.data.href.includes('/error')) {
      childWindow.close();
      window.removeEventListener('message', (e) => {
        receiveMessage(e, childWindow);
      });
    }
  }

  const saveTemplateSource = async (eqp) => {
    const data = {
      sessionState,
      currentStepUserInput: {
        eqp
      },
      apiKey,
      userId, 
      baseSourceName,
      newSourceNamePrefix
    }

    const config = {
      headers: {
        ...headers,
        Authorization: bearerToken
      },
      data,
      url: `${apiUrl}/connector-studio/integration-setup/save-template-source`,
      method: "POST"
    }

    try {
      const response = await axios.request(config);
      console.log(response)
    } catch(error) {

    }

  }
  
}.call(this));
