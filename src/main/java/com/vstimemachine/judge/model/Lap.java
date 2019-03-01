package com.vstimemachine.judge.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
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

    @Enumerated(EnumType.STRING)
    private TypeLap typeLap;
    private LocalDateTime dateCreate = LocalDateTime.now();

    @ManyToOne
    //@RestResource(exported = false)
    private Sportsman sportsman;

    @ManyToOne
    private Round round;

    @ManyToOne
    private Group group;

    @ManyToOne
    private Gate gate;


}
