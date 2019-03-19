package com.vstimemachine.judge.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.vstimemachine.judge.component.event.RoundExtraActionEvent;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import org.springframework.data.domain.AbstractAggregateRoot;

import javax.persistence.*;
import java.time.LocalDateTime;
import java.util.Set;

@Data
@Entity
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode(of = { "id" })
public class Round extends AbstractAggregateRoot {

    @Id
    @GeneratedValue
    private Long id;

    @Version
    @JsonIgnore
    private Long version;
    private LocalDateTime dateCreate = LocalDateTime.now();



    private String name;

    @Enumerated(EnumType.STRING)
    private TypeRound typeRound;

    @Enumerated(EnumType.STRING)
    private TypeRace typeRace;

    @Enumerated(EnumType.STRING)
    private TypeRaceElimination typeRaceElimination;

    @Enumerated(EnumType.STRING)
    private TypeParentEntity typeParentEntity;

    @Enumerated(EnumType.STRING)
    private TypeGenerateRound typeGenerateRound;
    private Integer countSportsmen = 0;
    private Boolean selected = false;
    private Integer countLap = 0;
    private Integer maxTimeRace = 0;
    private Integer minTimeLap = 0;
    private Integer sort = 0;
    private Boolean close = false;
    private Long fromRoundCopy;
    private Long parentEntityId;
    private Integer topLimit;


    @ManyToOne
    private Competition competition;

    @OneToMany(cascade = CascadeType.ALL,
            fetch = FetchType.LAZY,
            mappedBy = "round")
    @OrderBy("sort ASC")
    private Set<Group> groups;

//    @PreRemove
//    private void removeRound() {
//        if(groups != null) {
//            groups.forEach(group -> {
//                group.setRound(null);
//            });
//        }
//    }

    public Round initExtraAction(String path) {
        registerEvent(new RoundExtraActionEvent(this, path));
        return this;
    }
}
