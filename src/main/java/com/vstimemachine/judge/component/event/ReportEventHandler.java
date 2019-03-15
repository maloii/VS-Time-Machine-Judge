package com.vstimemachine.judge.component.event;

import com.vstimemachine.judge.model.Report;
import lombok.RequiredArgsConstructor;
import org.springframework.data.rest.core.annotation.HandleAfterCreate;
import org.springframework.data.rest.core.annotation.HandleAfterDelete;
import org.springframework.data.rest.core.annotation.HandleAfterSave;
import org.springframework.data.rest.core.annotation.RepositoryEventHandler;
import org.springframework.hateoas.EntityLinks;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

import static com.vstimemachine.judge.configuration.WebSocketConfiguration.MESSAGE_PREFIX;


@Component
@RepositoryEventHandler(Report.class)
@RequiredArgsConstructor
public class ReportEventHandler {

    private final SimpMessagingTemplate websocket;

    private final EntityLinks entityLinks;

    @HandleAfterCreate
    public void newReport(Report report) {
        this.websocket.convertAndSend(
                MESSAGE_PREFIX + "/newReport", getPath(report));
    }

    @HandleAfterDelete
    public void deleteReport(Report report) {
        this.websocket.convertAndSend(
                MESSAGE_PREFIX + "/deleteReport", getPath(report));
    }

    @HandleAfterSave
    public void updateReport(Report report) {
        this.websocket.convertAndSend(
                MESSAGE_PREFIX + "/updateReport", getPath(report));
    }

    /**
     * Take an {@link Report} and get the URI using Spring Data REST's {@link EntityLinks}.
     *
     * @param report
     */
    private String getPath(Report report) {
        return this.entityLinks.linkForSingleResource(report.getClass(),
                report.getId()).toUri().getPath();
    }
}
