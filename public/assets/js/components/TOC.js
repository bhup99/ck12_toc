/******************************************
 *  Author : Author   
 *  Created On : Tue Mar 05 2019
 *  File : TOC.js
 *******************************************/


class TOC extends React.Component {
    constructor(props)  {
        super(props);
        this.state = {
            firstLevelHeading: [],  // will store first level chapter/lessions
            secLevelHeading: [],    // will store second level lessons
            openChapter: -1,        // keeps track of which chapters are open at the moment
            loading: false,         // shows a sign that an api request is in progress
            error: ""
        }

        //doing the bind one time only, to avoid bind on every render
        this.handleFirstLevelClickBind = this.handleFirstLevelClick.bind(this);
        this.updateSecLevelHeadingBind = this.updateSecLevelHeading.bind(this);
        this.errorHandlerBind = this.errorHandler.bind(this);
    }

    //is generic for all kind of async requests
    asyncApiCall(theUrl, callbackSuccess, callbackFailure)
    {
        var xmlHttp = new XMLHttpRequest();
        xmlHttp.onreadystatechange = () => { 
            if (xmlHttp.readyState == 4)
            {
                this.setState({loading: false});
                if (xmlHttp.status == 200)
                {
                    callbackSuccess(xmlHttp.responseText);
                }
                else
                {
                    callbackFailure(xmlHttp.responseText)
                }
            }
        }
        xmlHttp.open("GET", theUrl, true); // true for asynchronous 
        xmlHttp.send(null);
    }

    componentDidMount()
    {
        // making the request for first level chapters/lessons after the component mount for one-time only
        this.asyncApiCall("http://localhost:3000/api/book/maths", this.updateFirstLevelHeading.bind(this), this.errorHandlerBind);
    }

    errorHandler(resp)
    {
        this.setState({
            error: JSON.parse(resp).response.message
        })
    }

    updateFirstLevelHeading(resp)
    {
        this.setState({
            firstLevelHeading: JSON.parse(resp).response,
            error: ""
        })
    }

    updateSecLevelHeading(resp)
    {
        this.setState({
            secLevelHeading: JSON.parse(resp).response[this.state.openChapter],
            error: ""
        });
    }

    handleFirstLevelClick(id)
    {
        if (this.state.openChapter == id)
        {
            this.setState({
                openChapter: -1,
                secLevelHeading: []
            });
            return ;
        }
        this.setState({
            openChapter: id,
            secLevelHeading: [],
            loading: true
        });

        this.asyncApiCall("http://localhost:3000/api/book/maths/section/"+id, this.updateSecLevelHeadingBind, this.errorHandlerBind);
    }

    render()
    {
        let toc=[];
        if (this.state.firstLevelHeading.length == 0 && this.state.error)
        {
            return <Error message={this.state.error}></Error>;
        }

        this.state.firstLevelHeading.map((chapter) => {
            if (chapter.type == "chapter")
            {
                let compPercent = (chapter.completeCount/chapter.childrenCount)*100;
                toc.push(<button style={{color: 'blue'}} onClick={() => this.handleFirstLevelClickBind(chapter.id)} id={chapter.id}>{chapter.title}</button>);
                toc.push(<span> {' '}  {chapter.completeCount}/{chapter.childrenCount} </span>);
                toc.push(<br/>);
                if (chapter.id == this.state.openChapter)
                {
                    if (this.state.loading)
                    {
                        toc.push(<span>Loading...</span>);
                    }
                    else
                    {
                        if (this.state.secLevelHeading.length == 0 && this.state.error)
                        {
                            toc.push(<Error message={this.state.error}></Error>);
                        }
                        else
                        {
                            this.state.secLevelHeading.map((lesson) => {
                                if (lesson.status ==  "COMPLETE")
                                    toc.push(<div id={lesson.id} style={{color: "green"}}>{lesson.title}</div>);
                                else
                                    toc.push(<div id={lesson.id}>{lesson.title}</div>);
                            })
                        }
                    }
                    toc.push(<hr />);
                }
            }
            else
                toc.push(<div style={{color: 'blue'}} id={chapter.id}>{chapter.title}</div>);
        });
        if (!this.state.firstLevelHeading.length)
            toc = null;
        return <div>{toc}</div>;
    }
}