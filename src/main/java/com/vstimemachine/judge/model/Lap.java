package com.vstimemachine.judge.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Formula;
import org.springframework.data.rest.core.annotation.RestResource;

import javax.persistence.*;
import java.time.LocalDateTime;

@Data
@Entity
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode(of = { "id" })
public class Lap {

    @Id
    @GeneratedValue
    private Long id;

    @Version
    @JsonIgnore
    private Long version;

    private Long millisecond;

    @Formula(value="(SELECT millisecond-l.millisecond FROM Lap l WHERE id>l.id AND l.group_sportsman_id=group_sportsman_id AND (l.type_lap='OK' OR l.type_lap='START') order by l.id DESC LIMIT 1)")
    @Basic(fetch=FetchType.EAGER)
    private Long timeLap;

    @Enumerated(EnumType.STRING)
    private TypeLap typeLap;
    private LocalDateTime dateCreate = LocalDateTime.now();

    @ManyToOne
    private Sportsman sportsman;

    @ManyToOne
    private Round round;

    @ManyToOne
    private Group group;

    @ManyToOne
    private Gate gate;

    @ManyToOne
    private GroupSportsman groupSportsman;


}
